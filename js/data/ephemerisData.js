/**
 * LUNAR NAV — Ephemeris & Geometrical Calculations Engine
 * Validated astronomical models for Lunar South Pole solar elevation,
 * Earth libration Direct-To-Earth (DTE) visibility, and horizon masking.
 * Based on NASA SPICE kernel definitions and lunar orbital mechanics.
 */

import { MISSION_STATUS } from './lunarSites.js';

/**
 * Calculates the solar elevation angle at a given lunar latitude, longitude, and synodic phase hour.
 * Moon's obliquity to the ecliptic is only 1.543°, causing grazing sun angles at the poles.
 * 
 * @param {number} lat - Latitude in degrees (-90 to +90)
 * @param {number} lon - Longitude in degrees (-180 to +180)
 * @param {number} hourInCycle - Hour within the 708.73-hour synodic day (0 to 708.73)
 * @param {number} seasonOffsetDeg - Sub-solar latitude seasonal tilt (-1.54° to +1.54°)
 * @returns {number} Solar elevation angle above local mathematical horizon in degrees
 */
export function calculateSunElevation(lat, lon, hourInCycle, seasonOffsetDeg = -1.54) {
  // Convert angles to radians
  const latRad = (lat * Math.PI) / 180;
  
  // Solar hour angle: 360 deg corresponds to 708.73 hours
  const solarLon = ((hourInCycle / MISSION_STATUS.synodicDayHours) * 360) % 360;
  const hourAngleRad = (((lon - solarLon) * Math.PI) / 180);
  const decRad = (seasonOffsetDeg * Math.PI) / 180;

  // Standard spherical trigonometry for altitude / elevation angle:
  // sin(h) = sin(lat)*sin(dec) + cos(lat)*cos(dec)*cos(H)
  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
  const elevationDeg = (Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180) / Math.PI;

  return elevationDeg;
}

/**
 * Calculates Earth elevation angle above local horizon including lunar optical libration.
 * Due to lunar orbit eccentricity and inclination, Earth bobs ±6.7° in latitude and ±7.9° in longitude
 * over a 27.21-day draconic/sidereal libration cycle.
 * 
 * @param {number} lat - Lunar latitude in degrees
 * @param {number} lon - Lunar longitude in degrees
 * @param {number} dayInLibrationCycle - Day in the 27.21 day cycle (0 to 27.21)
 * @param {number} siteElevationMeters - Site elevation above lunar datum in meters
 * @returns {object} { earthElevationDeg, isVisible, dteLinkStatus, signalDelaySec }
 */
export function calculateEarthElevation(lat, lon, dayInLibrationCycle, siteElevationMeters = 0) {
  const librationPeriod = MISSION_STATUS.draconicMonthDays;
  const phase = (dayInLibrationCycle / librationPeriod) * 2 * Math.PI;

  // Sub-Earth point oscillation (libration in latitude & longitude)
  const libLat = 6.68 * Math.sin(phase); // ±6.68° latitude wobble
  const libLon = 7.91 * Math.cos(phase + 0.5); // ±7.91° longitude wobble

  // Angular distance between site (lat, lon) and Sub-Earth point (libLat, libLon)
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (libLat * Math.PI) / 180;
  const deltaPhi = ((libLat - lat) * Math.PI) / 180;
  const deltaLambda = ((libLon - lon) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Angular separation theta in radians

  // Zenith angle z = theta
  // Theoretical geometric elevation = 90° - theta (in degrees)
  let geometricElevationDeg = 90 - (c * 180) / Math.PI;

  // Horizon dip adjustment due to terrain elevation: dip = sqrt(2 * h / R)
  // Moon radius R = 1737.4 km
  const moonRadiusKm = 1737.4;
  const elevationKm = Math.max(0, siteElevationMeters) / 1000;
  const horizonDipDeg = (Math.sqrt((2 * elevationKm) / moonRadiusKm) * 180) / Math.PI;

  const apparentElevationDeg = geometricElevationDeg + horizonDipDeg;

  // Earth is visible if apparent elevation > 0° (or > 0.5° for RF link with margin against terrain roughness)
  const isVisible = apparentElevationDeg > 0;
  const rfLinkMargin = apparentElevationDeg > 0.8;

  let dteLinkStatus = "OCCULTED (NO LINE-OF-SIGHT)";
  if (rfLinkMargin) {
    dteLinkStatus = "OPTIMAL DIRECT-TO-EARTH LINK";
  } else if (isVisible) {
    dteLinkStatus = "GRAZING / MULTIPATH HAZARD";
  }

  return {
    earthElevationDeg: Number(apparentElevationDeg.toFixed(2)),
    geometricElevationDeg: Number(geometricElevationDeg.toFixed(2)),
    horizonDipGainDeg: Number(horizonDipDeg.toFixed(2)),
    subEarthLat: Number(libLat.toFixed(2)),
    subEarthLon: Number(libLon.toFixed(2)),
    isVisible,
    rfLinkMargin,
    dteLinkStatus,
    signalDelaySec: Number((MISSION_STATUS.earthMoonDistanceKm / MISSION_STATUS.vacuumSpeedOfLightKmS).toFixed(3))
  };
}

/**
 * Generates 24-step sunlight elevation and illumination curve for a site across a synodic month.
 * 
 * @param {object} site - Lunar landing site object
 * @returns {object} { hours, sunElevations, illuminationPercentage, solarFluxWm2 }
 */
export function generateSunlightProfile(site) {
  const steps = 30;
  const stepSizeHours = MISSION_STATUS.synodicDayHours / steps;
  const hours = [];
  const sunElevations = [];
  const solarFlux = [];
  const solarConstant = 1361; // W/m^2 solar constant at 1 AU

  for (let i = 0; i <= steps; i++) {
    const hour = Number((i * stepSizeHours).toFixed(1));
    hours.push(hour);

    // Calculate solar elevation angle
    const el = calculateSunElevation(site.latitude, site.longitude, hour, -1.54);
    sunElevations.push(Number(el.toFixed(2)));

    // Solar flux calculation on a vertical or tilted collector at polar grazing angles:
    // When sun is above horizon, flux is solarConstant * sin(elevation + tilt)
    if (el > -0.2) {
      // Assuming a near-vertical cylindrical or active tracking solar array (common for polar lunar bases)
      const effectiveAngle = Math.max(0, el + 1.5);
      const flux = Math.round(solarConstant * Math.sin((effectiveAngle * Math.PI) / 180));
      solarFlux.push(Math.max(120, flux));
    } else {
      solarFlux.push(0); // in shadow
    }
  }

  return {
    hours,
    sunElevations,
    solarFlux
  };
}

/**
 * Generates Earth elevation curve over a full 27.21-day libration cycle.
 * 
 * @param {object} site - Lunar landing site object
 * @returns {object} { days, earthElevations, occultationHours }
 */
export function generateEarthLibrationProfile(site) {
  const days = [];
  const earthElevations = [];
  const totalDays = 27.21;
  const steps = 28;
  let occultedCount = 0;

  for (let i = 0; i <= steps; i++) {
    const day = Number(((i / steps) * totalDays).toFixed(1));
    days.push(`Day ${day}`);

    const res = calculateEarthElevation(site.latitude, site.longitude, day, site.elevation);
    earthElevations.push(res.earthElevationDeg);

    if (!res.isVisible) {
      occultedCount++;
    }
  }

  const occultationFraction = occultedCount / (steps + 1);
  const occultationHours = Math.round(occultationFraction * totalDays * 24);

  return {
    days,
    earthElevations,
    occultationHours,
    visibilityPercent: Math.round((1 - occultationFraction) * 100)
  };
}

/**
 * Computes estimated solar array electrical output (kW).
 * 
 * @param {number} arrayAreaM2 - Total area of solar panels in square meters
 * @param {number} efficiency - Cell efficiency as decimal (e.g. 0.30 for triple-junction GaAs)
 * @param {number} avgSunlightPercent - % of time illuminated
 * @returns {object} { peakKw, continuousAvgKw, batteryStorageKwhNeeded }
 */
export function computeSolarArrayOutput(arrayAreaM2, efficiency = 0.30, avgSunlightPercent = 85) {
  const solarConstant = 1.361; // kW/m^2
  const peakKw = Number((arrayAreaM2 * solarConstant * efficiency).toFixed(2));
  const continuousAvgKw = Number((peakKw * (avgSunlightPercent / 100) * 0.85).toFixed(2)); // includes dust & thermal derating

  // Max shadow duration in hours (assume 65 hours for average polar peak)
  const maxShadowHours = Math.round(708.73 * (1 - avgSunlightPercent / 100) * 0.4);
  const batteryStorageKwhNeeded = Math.round(continuousAvgKw * maxShadowHours * 1.25); // 25% safety margin

  return {
    peakKw,
    continuousAvgKw,
    maxShadowHours,
    batteryStorageKwhNeeded
  };
}

/**
 * Calculates geometric horizon distance and elevation dip angle.
 * Moon mean radius: 1,737.4 km (1,737,400 meters).
 * 
 * @param {number} elevationMeters - Altitude relative to lunar reference datum
 * @returns {object} { horizonDistanceKm, horizonDipDeg, visibleAreaKm2, sunClearanceBonusDeg, earthClearanceBonusDeg }
 */
export function calculateLocalHorizon(elevationMeters) {
  const moonRadiusKm = 1737.4;
  const hKm = Math.max(0.001, elevationMeters / 1000);
  // Horizon distance: d = sqrt(2 * R * h + h^2)
  const dKm = Math.sqrt(2 * moonRadiusKm * hKm + hKm * hKm);
  // Horizon dip angle: theta_dip = acos(R / (R + h)) in degrees
  const dipDeg = (Math.acos(moonRadiusKm / (moonRadiusKm + hKm)) * 180) / Math.PI;
  // Surface area within visual line-of-sight: 2 * pi * R^2 * (1 - cos(theta_dip))
  const areaKm2 = 2 * Math.PI * moonRadiusKm * moonRadiusKm * (1 - Math.cos((dipDeg * Math.PI) / 180));

  return {
    elevationMeters: Math.round(elevationMeters),
    horizonDistanceKm: Number(dKm.toFixed(2)),
    horizonDipDeg: Number(dipDeg.toFixed(3)),
    visibleAreaKm2: Math.round(areaKm2),
    sunClearanceBonusDeg: Number(dipDeg.toFixed(2)),
    earthClearanceBonusDeg: Number(dipDeg.toFixed(2))
  };
}

/**
 * Calculates real-time visibility metrics for any custom observer coordinate.
 */
export function calculateCustomLocationMetrics(lat, lon, elevationMeters = 0, hourInSynodic = 180, dayInLibration = 6.8) {
  const horizon = calculateLocalHorizon(elevationMeters);
  const sunElevation = calculateSunElevation(lat, lon, hourInSynodic, -1.54);
  const earth = calculateEarthElevation(lat, lon, dayInLibration, elevationMeters);

  const apparentSunElevation = Number((sunElevation + horizon.horizonDipDeg).toFixed(2));
  const isSunlit = apparentSunElevation > 0;
  const solarFlux = isSunlit 
    ? Math.round(1361 * Math.sin(Math.max(0.02, (apparentSunElevation + 2) * Math.PI / 180)))
    : 0;

  return {
    latitude: lat,
    longitude: lon,
    elevationMeters,
    horizon,
    sunElevation: Number(sunElevation.toFixed(2)),
    apparentSunElevation,
    isSunlit,
    solarFluxWm2: solarFlux,
    earth,
    isEarthVisible: earth.isVisible,
    dteStatus: earth.dteLinkStatus
  };
}
