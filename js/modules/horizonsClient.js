/**
 * LUNAR NAV — Horizons Live API Client
 * Calls the local Node.js proxy at /api/horizons which forwards to NASA/JPL Horizons.
 * Falls back gracefully to the analytical engine if network is unavailable.
 */

/**
 * Fetch real ephemeris data from the local Horizons proxy.
 * @param {object} params - { target, lat, lon, elevKm, startTime, stopTime, stepMinutes }
 * @returns {Promise<object>} - { status, source, records[], fallback }
 */
export async function fetchHorizonsEphemeris(params) {
  const { target = '10', lat, lon, elevKm = 0, startTime, stopTime, stepMinutes = 60 } = params;

  const url = new URL('/api/horizons', window.location.origin);
  url.searchParams.set('target', target);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('elevKm', elevKm);
  url.searchParams.set('startTime', startTime);
  url.searchParams.set('stopTime', stopTime);
  url.searchParams.set('step', stepMinutes);

  try {
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[HorizonsClient] API unavailable, using analytical fallback:', err.message);
    return {
      status: 'success',
      source: 'Analytical Engine (Horizons Offline)',
      fallback: true,
      records: []
    };
  }
}

/**
 * Fetch Sun ephemeris for a site over a date range.
 * Returns array of { time, azimuthDeg, elevationDeg, distanceKm, isSunlit }
 */
export async function fetchSunEphemeris(site, startDate, daysAhead = 30, stepMinutes = 240) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const stop = new Date(start.getTime() + daysAhead * 86400000);

  return fetchHorizonsEphemeris({
    target: '10',
    lat: site.latitude,
    lon: site.longitude,
    elevKm: (site.elevation || 0) / 1000,
    startTime: start.toISOString().slice(0, 10),
    stopTime: stop.toISOString().slice(0, 10),
    stepMinutes
  });
}

/**
 * Fetch Earth ephemeris for a site over a date range.
 * Returns array of { time, azimuthDeg, elevationDeg, distanceKm, isVisible, rfMarginOk }
 */
export async function fetchEarthEphemeris(site, startDate, daysAhead = 28, stepMinutes = 180) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const stop = new Date(start.getTime() + daysAhead * 86400000);

  return fetchHorizonsEphemeris({
    target: '399',
    lat: site.latitude,
    lon: site.longitude,
    elevKm: (site.elevation || 0) / 1000,
    startTime: start.toISOString().slice(0, 10),
    stopTime: stop.toISOString().slice(0, 10),
    stepMinutes
  });
}

/**
 * Analyze a fetched ephemeris result for windows (sunlit periods, comm windows, etc.)
 * @param {Array} records - Ephemeris records
 * @param {string} visibilityKey - 'isSunlit' or 'isVisible'
 * @returns {object} { windowCount, totalHoursVisible, avgElevation, maxElevation, minElevation }
 */
export function analyzeEphemerisWindows(records, visibilityKey = 'isSunlit') {
  if (!records || records.length === 0) return { windowCount: 0, totalHoursVisible: 0, avgElevation: 0, maxElevation: 0, minElevation: 0 };

  const elevations = records.map(r => r.elevationDeg).filter(e => !isNaN(e));
  const visibleRecords = records.filter(r => r[visibilityKey]);
  
  // Count windows (transitions from invisible to visible)
  let windowCount = 0;
  let wasVisible = false;
  for (const r of records) {
    const isNowVisible = !!r[visibilityKey];
    if (isNowVisible && !wasVisible) windowCount++;
    wasVisible = isNowVisible;
  }

  // Estimate step size from first two records
  let stepHours = 4;
  if (records.length >= 2) {
    const t1 = new Date(records[0].time).getTime();
    const t2 = new Date(records[1].time).getTime();
    if (!isNaN(t1) && !isNaN(t2)) {
      stepHours = (t2 - t1) / 3600000;
    }
  }

  const totalHoursVisible = visibleRecords.length * stepHours;

  return {
    windowCount,
    totalHoursVisible: Math.round(totalHoursVisible * 10) / 10,
    avgElevation: elevations.length ? Math.round(elevations.reduce((a, b) => a + b, 0) / elevations.length * 100) / 100 : 0,
    maxElevation: elevations.length ? Math.round(Math.max(...elevations) * 100) / 100 : 0,
    minElevation: elevations.length ? Math.round(Math.min(...elevations) * 100) / 100 : 0,
    visibilityPercent: records.length ? Math.round(visibleRecords.length / records.length * 1000) / 10 : 0
  };
}
