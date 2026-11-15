/**
 * LUNAR NAV — Lunar Crater and Landmark Features Catalog
 * Scientific data from USGS Astrogeology Science Center and IAU Gazetteer of Planetary Nomenclature.
 */

export const LUNAR_CRATER_CATALOG = [
  // Lunar South Pole Region (Artemis Exploration Corridor)
  {
    name: "Shackleton Crater",
    latitude: -89.67,
    longitude: 0.0,
    diameterKm: 21.0,
    depthKm: 4.2,
    type: "Impact Crater (Simple)",
    region: "Lunar South Pole",
    psrAreaKm2: 346,
    tempKelvin: 40,
    notes: "Nearly circular rim centered right at the South Pole. The interior floor has been plunged in permanent darkness for >2 billion years, preserving ancient volatiles."
  },
  {
    name: "Cabeus Crater",
    latitude: -84.9,
    longitude: -35.5,
    diameterKm: 98.0,
    depthKm: 3.9,
    type: "Degraded Complex Crater",
    region: "Lunar South Pole",
    psrAreaKm2: 950,
    tempKelvin: 38,
    notes: "Site of the historic 2009 NASA LCROSS impact experiment that confirmed the existence of pure water ice grains and hydroxyl in the ejecta plume."
  },
  {
    name: "Faustini Crater",
    latitude: -87.1,
    longitude: 84.3,
    diameterKm: 39.0,
    depthKm: 3.1,
    type: "Complex Crater",
    region: "Lunar South Pole",
    psrAreaKm2: 410,
    tempKelvin: 45,
    notes: "Neighboring Shoemaker Crater. Rim topography acts as an elevated sunlight receptor while the floor maintains thermal stability < 50 K."
  },
  {
    name: "Haworth Crater",
    latitude: -87.4,
    longitude: -5.5,
    diameterKm: 35.0,
    depthKm: 3.5,
    type: "Complex Crater",
    region: "Lunar South Pole",
    psrAreaKm2: 375,
    tempKelvin: 33,
    notes: "Coldest recorded place in the Solar System by LRO Diviner instrument, plunging down to 33 Kelvin (-240°C), colder than Pluto's surface."
  },
  {
    name: "Shoemaker Crater",
    latitude: -88.1,
    longitude: 45.9,
    diameterKm: 50.9,
    depthKm: 3.0,
    type: "Degraded Impact Crater",
    region: "Lunar South Pole",
    psrAreaKm2: 520,
    tempKelvin: 42,
    notes: "Named in honor of pioneer astrogeologist Eugene Shoemaker, whose cremated ashes were carried to the Moon aboard Lunar Prospector in 1999."
  },
  {
    name: "de Gerlache Crater",
    latitude: -88.5,
    longitude: -87.1,
    diameterKm: 32.4,
    depthKm: 3.2,
    type: "Impact Crater",
    region: "Lunar South Pole",
    psrAreaKm2: 290,
    tempKelvin: 48,
    notes: "Highly asymmetric rim with prominent elevated peaks that receive up to 85% sunlight, contrasting against pitch-black floor."
  },
  {
    name: "Nobile Crater",
    latitude: -85.2,
    longitude: 53.5,
    diameterKm: 73.0,
    depthKm: 3.8,
    type: "Complex Crater",
    region: "Lunar South Pole",
    psrAreaKm2: 480,
    tempKelvin: 52,
    notes: "Broad, ancient crater forming the highland plateau chosen for NASA's VIPER prospecting rover landing investigations."
  },
  {
    name: "Amundsen Crater",
    latitude: -84.5,
    longitude: 82.8,
    diameterKm: 103.0,
    depthKm: 4.8,
    type: "Prominent Complex Crater with Central Peak",
    region: "Lunar South Pole",
    psrAreaKm2: 1240,
    tempKelvin: 55,
    notes: "Massive crater with terrace walls and sharp central peak. High geologic age, providing deep crustal cross-section."
  },
  // Global Landmarks for full 3D Moon Exploration
  {
    name: "Tycho Crater",
    latitude: -43.3,
    longitude: -11.2,
    diameterKm: 85.0,
    depthKm: 4.8,
    type: "Copernican Impact Crater (Ray System)",
    region: "Southern Highlands",
    psrAreaKm2: 0,
    tempKelvin: 220,
    notes: "Spectacular young crater (108 million years old) featuring immense bright rays stretching over 1,500 km across the lunar nearside."
  },
  {
    name: "Copernicus Crater",
    latitude: 9.7,
    longitude: -20.0,
    diameterKm: 93.0,
    depthKm: 3.8,
    type: "Complex Crater with Terraced Walls",
    region: "Oceanus Procellarum",
    psrAreaKm2: 0,
    tempKelvin: 250,
    notes: "Quintessential complex impact crater with multi-tiered slump terraces and three prominent central mountain peaks."
  },
  {
    name: "Clavius Crater",
    latitude: -58.4,
    longitude: -14.4,
    diameterKm: 231.0,
    depthKm: 4.9,
    type: "Vast Impact Basin",
    region: "Southern Highlands",
    psrAreaKm2: 0,
    tempKelvin: 190,
    notes: "One of the largest craters on the Moon visible with the naked eye. In 2020, NASA SOFIA airborne telescope detected molecular water in Clavius's sunlit regolith."
  },
  {
    name: "Apollo 11 Landing Site (Statio Tranquillitatis)",
    latitude: 0.67,
    longitude: 23.47,
    diameterKm: 0,
    depthKm: 0,
    type: "Historic Human Landing Site",
    region: "Mare Tranquillitatis",
    psrAreaKm2: 0,
    tempKelvin: 260,
    notes: "Historic first human touchdown on July 20, 1969 by Neil Armstrong and Buzz Aldrin aboard Apollo 11 Lunar Module Eagle."
  }
];
