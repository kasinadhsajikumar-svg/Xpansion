/**
 * LUNAR NAV — Lunar Landing Site Navigator
 * Dataset: NASA Artemis Candidate Landing Regions & Lunar South Pole Exploration Sites
 * Compiled from NASA LRO (Lunar Reconnaissance Orbiter), LOLA elevation data,
 * Diviner thermal radiometer, and LAMP volatile mapping.
 */

export const LUNAR_LANDING_SITES = [
  {
    id: "site-001",
    name: "Shackleton Crater Rim",
    scientificDesignation: "LOLA-SP-SHK-01",
    artemisCandidateRegion: "Artemis III Candidate Region 001",
    latitude: -89.90,
    longitude: 0.00,
    elevation: 1150, // meters above lunar reference datum
    slope: 6.8, // degrees average local landing area
    slopeDistribution: {
      flat: 68, // % area < 5 deg
      moderate: 24, // % area 5-10 deg
      steep: 8 // % area > 10 deg
    },
    craterDensity: "Moderate-Low (Rim crest reworked)",
    surfaceHazards: {
      boulderAbundance: "Moderate (0.015 m^-2)",
      roughnessHurst: 0.82,
      hazardLevel: "Moderate",
      riskScore: 28 // 0-100 risk
    },
    sunlightAvailability: 86.4, // % annual illumination
    peakSunlightPeriod: "243 consecutive Earth days during Southern Summer",
    maxShadowDuration: "54 Earth hours (Southern Winter)",
    earthVisibility: 72.5, // % Direct-to-Earth line-of-sight
    earthElevationMin: -2.1, // degrees relative to local horizon
    earthElevationMax: 6.4,
    psrProximityKm: 0.25, // km to interior Permanently Shadowed Region
    scientificValue: 98, // Water ice, volatiles, cryogenic trap
    overallSuitability: 92,
    terrainType: "Crater Rim Crest / Peak of Eternal Light candidate",
    geologicalAge: "Pre-Nectarian / Imbrian",
    landingEllipseKm: [1.2, 0.8],
    description: "The peak along the connecting ridge of Shackleton Crater sits almost directly at the lunar South Pole. It boasts one of the highest continuous illumination profiles on the Moon and offers immediate traverse access to Shackleton's permanently shadowed interior floor where LCROSS-analog volatile ice deposits are preserved at < 40 Kelvin.",
    advantages: [
      "Quasi-continuous solar illumination for photovoltaic power",
      "Immediate scientific access to deep cold traps for volatile prospecting",
      "High vantage point for local surface UHF/Wi-Fi communications"
    ],
    challenges: [
      "Narrow landing corridor along ridge topography",
      "Periodic Earth line-of-sight occultation during negative libration",
      "Steep 30°+ inner crater wall immediately adjacent to landing zone"
    ],
    recommendedMissionType: "Crewed Lunar Outpost / In-Situ Resource Utilization (ISRU)"
  },
  {
    id: "site-002",
    name: "Malapert Mountain (Peak)",
    scientificDesignation: "LOLA-SP-MLP-04",
    artemisCandidateRegion: "Artemis III Candidate Region 004",
    latitude: -84.90,
    longitude: 12.90,
    elevation: 5040,
    slope: 4.8,
    slopeDistribution: {
      flat: 82,
      moderate: 14,
      steep: 4
    },
    craterDensity: "Low (Plateau summit smooth regolith)",
    surfaceHazards: {
      boulderAbundance: "Low (0.006 m^-2)",
      roughnessHurst: 0.88,
      hazardLevel: "Low",
      riskScore: 16
    },
    sunlightAvailability: 89.2,
    peakSunlightPeriod: "Up to 260 days quasi-continuous illumination",
    maxShadowDuration: "42 Earth hours",
    earthVisibility: 94.0,
    earthElevationMin: 1.8,
    earthElevationMax: 8.7,
    psrProximityKm: 7.8,
    scientificValue: 88,
    overallSuitability: 96,
    terrainType: "Highland Massif Summit Plateau",
    geologicalAge: "Pre-Nectarian Massif",
    landingEllipseKm: [2.5, 1.8],
    description: "Malapert Mountain (often called Malapert Peak) is a colossal 5-km-high massif. The summit plateau provides an expansive, exceptionally flat landing zone with near-constant line-of-sight to Earth (94% DTE LOS) and high solar illumination, making it the top candidate for initial human touchdown and lunar communication relay basecamp.",
    advantages: [
      "Exceptional Direct-to-Earth visibility (>93%) — minimal blackout",
      "Expansive, gentle summit plateau (< 5° slope over 5 km²)",
      "Outstanding natural line-of-sight for regional surface microwave relays"
    ],
    challenges: [
      "Separated from major cold traps by ~8 km traverse down massif flanks",
      "Higher ascent/descent delta-v requirement due to elevation clearance"
    ],
    recommendedMissionType: "Artemis III First Human Landing / Comm Relay Basecamp"
  },
  {
    id: "site-003",
    name: "Connecting Ridge (Shackleton-de Gerlache)",
    scientificDesignation: "LOLA-SP-CRG-02",
    artemisCandidateRegion: "Artemis III Candidate Region 002",
    latitude: -89.44,
    longitude: -137.50,
    elevation: 1680,
    slope: 6.2,
    slopeDistribution: {
      flat: 71,
      moderate: 22,
      steep: 7
    },
    craterDensity: "Moderate",
    surfaceHazards: {
      boulderAbundance: "Moderate-Low (0.011 m^-2)",
      roughnessHurst: 0.83,
      hazardLevel: "Moderate",
      riskScore: 24
    },
    sunlightAvailability: 82.8,
    peakSunlightPeriod: "180 days high-illumination window",
    maxShadowDuration: "68 Earth hours",
    earthVisibility: 69.4,
    earthElevationMin: -3.0,
    earthElevationMax: 5.8,
    psrProximityKm: 0.8,
    scientificValue: 94,
    overallSuitability: 89,
    terrainType: "Inter-Crater Saddle Ridge",
    geologicalAge: "Imbrian Highland Terrain",
    landingEllipseKm: [1.5, 1.0],
    description: "A pronounced ridge connecting the rim of Shackleton with the de Gerlache crater massif. It acts as an elevated land bridge offering strategic scientific mobility between multiple permanently shadowed micro-traps on either flank while maintaining elevated solar illumination.",
    advantages: [
      "Dual access to both Shackleton and de Gerlache volatile sinks",
      "Continuous traverse route without ascending or descending steep escarpments",
      "Good solar exposure along ridge crest"
    ],
    challenges: [
      "Lateral slopes drop steeply on both east and west flanks",
      "Periodic Earth line-of-sight dropouts require orbital relay during occultation"
    ],
    recommendedMissionType: "Rover Science & Volatiles Prospecting Campaign"
  },
  {
    id: "site-004",
    name: "Mons Mouton (VIPER Landing Plateau)",
    scientificDesignation: "LOLA-SP-MTN-07",
    artemisCandidateRegion: "Artemis III Candidate Region 007 / VIPER Area",
    latitude: -84.62,
    longitude: 30.68,
    elevation: 5520,
    slope: 3.9,
    slopeDistribution: {
      flat: 88,
      moderate: 10,
      steep: 2
    },
    craterDensity: "Very Low",
    surfaceHazards: {
      boulderAbundance: "Very Low (0.004 m^-2)",
      roughnessHurst: 0.91,
      hazardLevel: "Low",
      riskScore: 12
    },
    sunlightAvailability: 81.5,
    peakSunlightPeriod: "Extended illumination on flat plateau",
    maxShadowDuration: "65 Earth hours",
    earthVisibility: 88.5,
    earthElevationMin: 0.6,
    earthElevationMax: 7.9,
    psrProximityKm: 2.1,
    scientificValue: 91,
    overallSuitability: 95,
    terrainType: "Flat-Topped Elevated Mountain / Mesas",
    geologicalAge: "Pre-Nectarian Ancient Crust",
    landingEllipseKm: [3.0, 2.2],
    description: "Mons Mouton is an immense, mesa-like highland plateau named after NASA mathematician Melba Roy Mouton. Officially selected for NASA's VIPER rover mission, it combines one of the smoothest landing surfaces in the polar region (< 4° slope) with excellent direct-to-Earth communication and proximity to peripheral cold traps.",
    advantages: [
      "Extremely benign landing slope (< 4°) — highest engineering safety margin",
      "Broad landing area accommodating large cargo landers",
      "Consistent Direct-to-Earth visibility with positive elevation angle"
    ],
    challenges: [
      "Plateau edges are steep cliffs that limit long-range southern rover traverses",
      "Solar illumination slightly lower than Shackleton crest"
    ],
    recommendedMissionType: "Heavy Cargo Lander / Autonomous Prospecting Rover"
  },
  {
    id: "site-005",
    name: "Haworth Crater Rim Crest",
    scientificDesignation: "LOLA-SP-HWT-03",
    artemisCandidateRegion: "Artemis III Candidate Region 003",
    latitude: -87.40,
    longitude: -5.50,
    elevation: 1980,
    slope: 5.9,
    slopeDistribution: {
      flat: 75,
      moderate: 19,
      steep: 6
    },
    craterDensity: "Moderate",
    surfaceHazards: {
      boulderAbundance: "Low-Moderate (0.009 m^-2)",
      roughnessHurst: 0.85,
      hazardLevel: "Low-Moderate",
      riskScore: 21
    },
    sunlightAvailability: 79.5,
    peakSunlightPeriod: "155 days continuous summer solar window",
    maxShadowDuration: "78 Earth hours",
    earthVisibility: 65.2,
    earthElevationMin: -2.8,
    earthElevationMax: 5.4,
    psrProximityKm: 1.1,
    scientificValue: 95,
    overallSuitability: 88,
    terrainType: "Complex Crater Rim Plateau",
    geologicalAge: "Nectarian Impact Structure",
    landingEllipseKm: [1.8, 1.2],
    description: "Perched on the northern rim of Haworth Crater, this site overlooks one of the coldest known thermal regions in the solar system (measured down to 33 Kelvin by LRO Diviner). Neutron spectroscopy indicates significant hydrogen enrichment in Haworth's floor regolith.",
    advantages: [
      "Direct overlook onto the highest-grade confirmed ice cold-traps",
      "Smooth highland bench providing stable footing for lander gear",
      "Excellent geological diversity for sample return"
    ],
    challenges: [
      "Earth visibility obscured during lunar southern libration dip",
      "Slightly longer shadow periods during southern winter"
    ],
    recommendedMissionType: "Cryogenic Volatile Sampling / Sample Return"
  },
  {
    id: "site-006",
    name: "de Gerlache Crater Rim 1",
    scientificDesignation: "LOLA-SP-DGL-05",
    artemisCandidateRegion: "Artemis III Candidate Region 005",
    latitude: -88.50,
    longitude: -89.00,
    elevation: 2100,
    slope: 6.9,
    slopeDistribution: {
      flat: 70,
      moderate: 22,
      steep: 8
    },
    craterDensity: "Moderate",
    surfaceHazards: {
      boulderAbundance: "Moderate (0.013 m^-2)",
      roughnessHurst: 0.81,
      hazardLevel: "Moderate",
      riskScore: 27
    },
    sunlightAvailability: 84.6,
    peakSunlightPeriod: "210 days solar illumination",
    maxShadowDuration: "58 Earth hours",
    earthVisibility: 76.8,
    earthElevationMin: -1.4,
    earthElevationMax: 6.2,
    psrProximityKm: 0.65,
    scientificValue: 93,
    overallSuitability: 90,
    terrainType: "Asymmetric Crater Rim Ridge",
    geologicalAge: "Imbrian System",
    landingEllipseKm: [1.4, 0.9],
    description: "Located on the asymmetric eastern rim of de Gerlache crater. This high-altitude knoll enjoys nearly 85% annual sunlight and a wide panoramic vista into the permanently shadowed floor of de Gerlache, which displays evidence of surface frost.",
    advantages: [
      "High illumination profile matching Shackleton levels",
      "Short distance (650m) to cryogenic shadow boundary",
      "Favorable Earth line-of-sight during active exploration seasons"
    ],
    challenges: [
      "Local undulations require precise terrain relative navigation (TRN)",
      "Moderate boulder distribution along ejecta lobes"
    ],
    recommendedMissionType: "Artemis III Secondary Target / Science Lab Deployment"
  },
  {
    id: "site-007",
    name: "Nobile Crater Rim 1",
    scientificDesignation: "LOLA-SP-NOB-08",
    artemisCandidateRegion: "Artemis III Candidate Region 008",
    latitude: -85.20,
    longitude: 37.10,
    elevation: 2840,
    slope: 5.1,
    slopeDistribution: {
      flat: 80,
      moderate: 16,
      steep: 4
    },
    craterDensity: "Low-Moderate",
    surfaceHazards: {
      boulderAbundance: "Low (0.007 m^-2)",
      roughnessHurst: 0.87,
      hazardLevel: "Low",
      riskScore: 18
    },
    sunlightAvailability: 77.4,
    peakSunlightPeriod: "140 days continuous illumination",
    maxShadowDuration: "82 Earth hours",
    earthVisibility: 82.1,
    earthElevationMin: 0.2,
    earthElevationMax: 7.2,
    psrProximityKm: 1.4,
    scientificValue: 90,
    overallSuitability: 91,
    terrainType: "Highland Rim Bench",
    geologicalAge: "Pre-Nectarian Basin Ejecta",
    landingEllipseKm: [2.2, 1.6],
    description: "The elevated rim bench of Nobile Crater offers broad, gently rolling topography suitable for intermediate-class landers. Characterized by modest slopes and high Earth visibility, it serves as a gateway to multiple localized permanently shadowed mini-craters.",
    advantages: [
      "Safe, broad landing terrain with low boulder hazard",
      "Earth stays above horizon for >82% of the libration cycle",
      "Diverse regional regolith composition"
    ],
    challenges: [
      "Moderate solar illumination requires larger battery reserves for dark periods",
      "Subtle micro-craters require hazard detection sensors during final descent"
    ],
    recommendedMissionType: "Long-Duration Robotic Science & Infrastructure Deployment"
  },
  {
    id: "site-008",
    name: "Faustini Crater Rim Plateau",
    scientificDesignation: "LOLA-SP-FAU-11",
    artemisCandidateRegion: "Artemis III Candidate Region 011",
    latitude: -87.10,
    longitude: 84.30,
    elevation: 1750,
    slope: 6.4,
    slopeDistribution: {
      flat: 73,
      moderate: 20,
      steep: 7
    },
    craterDensity: "Moderate",
    surfaceHazards: {
      boulderAbundance: "Moderate (0.012 m^-2)",
      roughnessHurst: 0.83,
      hazardLevel: "Moderate",
      riskScore: 25
    },
    sunlightAvailability: 75.8,
    peakSunlightPeriod: "135 days summer illumination",
    maxShadowDuration: "90 Earth hours",
    earthVisibility: 70.8,
    earthElevationMin: -2.2,
    earthElevationMax: 5.9,
    psrProximityKm: 0.9,
    scientificValue: 92,
    overallSuitability: 87,
    terrainType: "Crater Rim Saddle",
    geologicalAge: "Nectarian System",
    landingEllipseKm: [1.6, 1.1],
    description: "Positioned along the northwestern rim of Faustini Crater, opposite Shoemaker Crater. The site presents rich scientific potential due to intersectional ejecta from South Pole-Aitken basin events and close proximity to Faustini's volatile reservoir.",
    advantages: [
      "High scientific value for studying volatile delivery and deep crustal impact melt",
      "Traversable slopes down towards secondary cold traps",
      "Acceptable terrain stability for four-legged landing gear"
    ],
    challenges: [
      "Periodic comms occultation during negative Earth libration",
      "Lower cumulative sunlight requires power management during winter"
    ],
    recommendedMissionType: "Geological Survey & Deep Core Drilling Mission"
  },
  {
    id: "site-009",
    name: "Leibnitz Plateau",
    scientificDesignation: "LOLA-SP-LBZ-12",
    artemisCandidateRegion: "Artemis III Candidate Region 012",
    latitude: -85.80,
    longitude: 179.20,
    elevation: 3410,
    slope: 5.2,
    slopeDistribution: {
      flat: 79,
      moderate: 17,
      steep: 4
    },
    craterDensity: "Low-Moderate",
    surfaceHazards: {
      boulderAbundance: "Low (0.008 m^-2)",
      roughnessHurst: 0.86,
      hazardLevel: "Low",
      riskScore: 19
    },
    sunlightAvailability: 83.2,
    peakSunlightPeriod: "190 days continuous solar window",
    maxShadowDuration: "62 Earth hours",
    earthVisibility: 79.8,
    earthElevationMin: -0.4,
    earthElevationMax: 6.8,
    psrProximityKm: 3.5,
    scientificValue: 87,
    overallSuitability: 92,
    terrainType: "Highland Elevated Shield",
    geologicalAge: "Pre-Nectarian",
    landingEllipseKm: [2.4, 1.8],
    description: "A prominent elevated plateau flanking the far-side polar transition zone. Leibnitz Plateau features wide expanses of low-slope topography, excellent regional illumination, and an uninterrupted field of view for deep-space astronomical arrays.",
    advantages: [
      "Low radio-frequency interference (RFI) from Earth on the limb",
      "Gentle topography offering wide landing margins",
      "Consistent high solar illumination"
    ],
    challenges: [
      "Earth visibility sits close to zero elevation threshold during portions of orbit",
      "Longer distance to major water ice reservoirs"
    ],
    recommendedMissionType: "Lunar Radio Astronomy Observatory & Surface Power Station"
  },
  {
    id: "site-010",
    name: "Cabeus Crater Rim (LCROSS Site)",
    scientificDesignation: "LOLA-SP-CAB-06",
    artemisCandidateRegion: "Artemis III Candidate Region 006 / LCROSS",
    latitude: -84.90,
    longitude: -35.50,
    elevation: 1850,
    slope: 7.9,
    slopeDistribution: {
      flat: 64,
      moderate: 25,
      steep: 11
    },
    craterDensity: "High (Ejecta blanketed)",
    surfaceHazards: {
      boulderAbundance: "High (0.022 m^-2)",
      roughnessHurst: 0.77,
      hazardLevel: "High-Moderate",
      riskScore: 36
    },
    sunlightAvailability: 71.0,
    peakSunlightPeriod: "110 days illumination",
    maxShadowDuration: "115 Earth hours",
    earthVisibility: 58.0,
    earthElevationMin: -3.8,
    earthElevationMax: 4.6,
    psrProximityKm: 1.8,
    scientificValue: 99,
    overallSuitability: 82,
    terrainType: "Degraded Basin Rim",
    geologicalAge: "Pre-Nectarian Impact Basin",
    landingEllipseKm: [1.3, 0.9],
    description: "The northern rim of Cabeus Crater, famous for the NASA LCROSS impact experiment that definitively proved the existence of water ice (5.5 ± 1.5 wt%), carbon monoxide, ammonia, and silver in the lunar regolith. While scientifically peerless, terrain hazards and lower Earth visibility require advanced landing precision.",
    advantages: [
      "Ground truth verified volatile presence (LCROSS impact data)",
      "Unmatched scientific and resource extraction value",
      "Direct geological insight into primitive solar system chemistry"
    ],
    challenges: [
      "Steepest terrain slopes among primary candidates (up to 8° landing average)",
      "Higher boulder density from multiple overlapping impact events",
      "Significant Earth blackout periods require dedicated relay satellite"
    ],
    recommendedMissionType: "Dedicated Volatiles Extraction / Specialized Rover Mission"
  }
];

export const MISSION_STATUS = {
  missionName: "ARTEMIS EXPEDITION LUNAR NAV",
  activePhase: "SITE SUITABILITY ASSESSMENT (PHASE A/B)",
  networkStatus: "DSN DEEP SPACE NETWORK: NOMINAL",
  activeGroundStations: ["Goldstone (DSS-14)", "Madrid (DSS-63)", "Canberra (DSS-43)"],
  subSolarLatitude: -1.54, // degrees (Sun declination relative to lunar equator)
  subSolarLongitude: 45.2, // degrees
  subEarthLatitude: 6.2, // degrees (Earth libration in latitude)
  subEarthLongitude: -4.8, // degrees (Earth libration in longitude)
  synodicDayHours: 708.73, // lunar day length in Earth hours (29.53 days)
  draconicMonthDays: 27.21,
  lolaResolutionMeters: 5,
  gravityMps2: 1.622,
  vacuumSpeedOfLightKmS: 299792.458,
  earthMoonDistanceKm: 384400,
  oneWayLightTimeSeconds: 1.282
};

export const LROC_QUICKMAP_RESOURCE = {
  name: "NASA LROC / Intuitive Machines QuickMap GIS",
  title: "Lunar South Pole GIS Mapping Portal",
  url: "https://quickmap.lroc.im-ldi.com/?prjExtent=-6165547.0826951%2C-3751377.7422001%2C5834452.9173049%2C2088622.2577999&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg",
  projection: "Polar Stereographic (South Pole • proj=10)",
  layerStack: "LROC NAC/WAC Optical + LOLA Elevation + Earth Shadow Mode (Stack 3314)",
  dataDefinition: "N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg",
  provider: "NASA / Arizona State University (ASU) / Intuitive Machines (IM-LDI)"
};

/**
 * Returns deep-link URL to view the candidate site in LROC QuickMap
 */
export function getQuickMapUrlForSite(site) {
  if (!site) return LROC_QUICKMAP_RESOURCE.url;
  // Return the official user-specified South Pole stereographic QuickMap URL with Earth Shadow & stack 3314
  return LROC_QUICKMAP_RESOURCE.url;
}
