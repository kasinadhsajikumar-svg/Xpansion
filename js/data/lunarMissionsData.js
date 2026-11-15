/**
 * LUNAR NAV — Lunar Missions & Exploration Data
 * Comprehensive catalog of lunar exploration history, active missions,
 * the NASA Artemis programme, and the Canadian Space Agency's (CSA) Moon exploration portfolio.
 * 
 * Sources:
 * - Canadian Space Agency (CSA): https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/
 * - NASA Artemis & Science: https://www.nasa.gov/specials/artemis/ & https://science.nasa.gov/moon/
 * - International Space Exploration Coordination Group (ISECG) Global Exploration Roadmap
 */

export const CSA_EXPLORATION_DATA = {
  agencyName: "Canadian Space Agency (CSA) / Agence spatiale canadienne (ASC)",
  portalUrl: "https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/",
  tagline: "Canada's Role in Returning Humanity to the Moon",
  overview: "Canada is an indispensable Tier-1 partner in the international Artemis program and the Lunar Gateway. Through cutting-edge space robotics (Canadarm3), planetary science instruments, national astronaut missions, and the Lunar Exploration Accelerator Program (LEAP), Canada is helping pioneer sustainable lunar exploration, resource prospecting at the lunar South Pole, and the future human leap to Mars.",
  
  pillars: [
    {
      id: "canadarm3",
      title: "Canadarm3 on the Lunar Gateway",
      subtitle: "Artificial Intelligence-Driven Space Robotics for Deep Space",
      leadContractor: "MDA Space (Brampton, Ontario)",
      icon: "fa-robot",
      tag: "CORE CONTRIBUTION",
      stats: [
        { label: "Large Arm Reach", value: "8.5 m" },
        { label: "Degrees of Freedom", value: "7 Joint Axes" },
        { label: "Autonomy Level", value: "AI Autonomous Operations" },
        { label: "Target Orbit", value: "Lunar NRHO (~3,000 to 70,000 km)" }
      ],
      description: "Canadarm3 is Canada's flagship contribution to the NASA-led Lunar Gateway orbital station. Unlike Canadarm and Canadarm2 on the Space Shuttle and ISS which operated with real-time crew or ground teleoperation, Canadarm3 must operate autonomously for up to months at a time when the Gateway is unoccupied by crew and ground communication latency or line-of-sight constraints restrict real-time control.",
      capabilities: [
        "Autonomous structural inspection of Gateway exterior using high-resolution multispectral cameras and 3D LIDAR.",
        "Berthing and unberthing visiting commercial cargo spacecraft (SpaceX Dragon XL, ESA logistics).",
        "External orbital maintenance and orbital replacement unit (ORU) replacement using its Small Dexterous Arm.",
        "Assisting astronauts during spacewalks (EVAs) around the Moon.",
        "Relocating and servicing scientific payloads exposed to the cislunar deep-space radiation environment."
      ],
      components: [
        { name: "Large Arm", detail: "8.5-meter dexterous manipulator capable of anchoring to multiple Gateway base points and walking end-over-end across the station exterior." },
        { name: "Small Dexterous Arm", detail: "High-precision robotic arm optimized for delicate repairs, electronic connectors, and scientific instrument swaps." },
        { name: "Specialized Tool Suite", detail: "Advanced grippers, orbital cut-and-weld attachments, and optical inspection tools stored on external tool caddies." },
        { name: "Ground Control Centre", detail: "Operational control facility based in Saint-Hubert, Quebec, coordinating autonomous cislunar robotics." }
      ],
      officialLink: "https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/canadarm3/"
    },
    {
      id: "astronauts",
      title: "Canadian Lunar Astronauts: Artemis II & Beyond",
      subtitle: "First Non-American to Venture into Deep Space to the Moon",
      icon: "fa-user-astronaut",
      tag: "CREWED FLIGHTS",
      stats: [
        { label: "Artemis II Launch", value: "2025 - 2026" },
        { label: "Mission Profile", value: "Crewed Lunar Flyby (10 Days)" },
        { label: "Canadian Crew", value: "Jeremy Hansen (Primary)" },
        { label: "Canadian Backup", value: "Dr. Jenni Gibbons (Backup / CapCom)" }
      ],
      description: "In December 2020, Canada signed the historic Treaty-Level Gateway Agreement with NASA, ensuring two Canadian astronaut flight slots: one on the Artemis II crewed lunar flyby test mission, and a second long-duration expedition to the Lunar Gateway.",
      astronauts: [
        {
          name: "Col. Jeremy Hansen",
          role: "Mission Specialist 2 — Artemis II Crew",
          bio: "Born in London, Ontario, and raised in Ailsa Craig. Former Royal Canadian Air Force (RCAF) CF-18 fighter pilot and physicist. Selected as an astronaut in 2009. Hansen will make history as the first Canadian and first international partner astronaut ever to fly beyond low Earth orbit to the Moon.",
          quote: "It is not lost on any of us that the United States could choose to go back to the Moon alone. But NASA chose to build an international team, and Canada is so proud to be part of this brave journey.",
          training: "Caves, NEEMO undersea missions, lunar geology field training in the Canadian Arctic (Haughton Crater) and Sudbury impact structure."
        },
        {
          name: "Dr. Jenni Gibbons",
          role: "Canadian Backup Astronaut for Artemis II & Gateway CapCom",
          bio: "Born in Calgary, Alberta. Combustion scientist and engineer with a Ph.D. from the University of Cambridge. Selected as a CSA astronaut in 2017. Serves as Canadian operational backup for Artemis II and certified Lunar Gateway Capsule Communicator (CapCom).",
          quote: "Every element of Canadian science, from our robotics to our health technologies, is proving that small nations can lead global exploration with focused excellence.",
          training: "Mission Control flight director training, spacewalk training in NASA's Neutral Buoyancy Laboratory, geology field training."
        }
      ],
      officialLink: "https://www.asc-csa.gc.ca/eng/astronauts/canadian-astronauts/artemis-2/"
    },
    {
      id: "rover",
      title: "Canadian Lunar Rover Mission",
      subtitle: "Prospecting for Water Ice & Volatiles in South Pole Extreme Cold",
      leadContractor: "Canadensys Aerospace (Bolton, Ontario)",
      icon: "fa-truck-monster",
      tag: "SURFACE ROBOTICS",
      stats: [
        { label: "Rover Class", value: "~30 kg Micro-Rover" },
        { label: "Target Region", value: "Lunar South Pole" },
        { label: "Night Survival", value: "14 Earth Days (-200°C)" },
        { label: "Science Payloads", value: "6 Instruments (5 CAN + 1 NASA)" }
      ],
      description: "Canada's first robotic mission to the surface of the Moon is a ~30 kg micro-rover engineered to touch down near the lunar South Pole via NASA's Commercial Lunar Payload Services (CLPS) initiative. The rover's mission mandate is to hunt for water ice, measure polar radiation, and survive the punishing 14-day lunar night where temperatures plunge below -200°C.",
      capabilities: [
        "Surviving the extreme lunar polar cryogenic shadow without radioisotope thermal generators (using innovative battery isolation and thermal switches).",
        "High-definition 360-degree panoramic stereo mapping of micro-craters and boulder distribution.",
        "In-situ prospecting for volatile organics and hydroxyl/water signatures in permanently shadowed regions (PSRs).",
        "Autonomous driving across loose regolith slopes up to 20° using Canadian AI-driven visual odometry."
      ],
      payloads: [
        { name: "Lunar Hydrogen & Ice Neutron Spectrometer", role: "Measures sub-surface hydrogen concentration to detect water ice deposits up to 1 meter deep." },
        { name: "Deep Ultraviolet Raman & Fluorescence Spectrometer", role: "Identifies organic minerals and ice grains without disturbing pristine regolith." },
        { name: "Multispectral Regolith Imager", role: "Micro-scale optical examination of South Pole regolith grain size, morphology, and space weathering." },
        { name: "Canadian Radiation Dosimeter (L-RAD)", role: "Measures ionizing cosmic rays and solar energetic particles at the lunar surface for future astronaut safety." },
        { name: "Autonomous Navigation Camera System", role: "Stereoscopic 3D navigation and hazard detection cameras developed by Canadian industry." },
        { name: "NASA Contributed Payload", role: "Collaborative instrument supporting NASA CLPS joint scientific goals." }
      ],
      officialLink: "https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/canadian-lunar-rover/"
    },
    {
      id: "leap",
      title: "Lunar Exploration Accelerator Program (LEAP)",
      subtitle: "Funding Scientific Innovation, Academia, and Commercial Lunar Tech",
      icon: "fa-seedling",
      tag: "PROGRAM INITIATIVE",
      stats: [
        { label: "Program Budget", value: "$150M+ CAD Commitment" },
        { label: "Universities Funded", value: "12+ Canadian Universities" },
        { label: "Target Sectors", value: "AI, Mining, Health, Sensors" },
        { label: "Commercial Flights", value: "CLPS & Gateway Flights" }
      ],
      description: "The CSA's Lunar Exploration Accelerator Program (LEAP) is an aggressive national strategy designed to propel Canadian science, academia, and industry into the global lunar economy. LEAP awards competitive grants and contracts to test cutting-edge sensors, rovers, and medical instruments on the Moon.",
      focusAreas: [
        "Planetary Science: Advanced spectrometers and drill prototypes to sample lunar ice and minerals.",
        "Artificial Intelligence: Vision-based navigation algorithms capable of operating in low-angle polar lighting and deep shadow.",
        "Lunar Mining & ISRU: Regolith handling, dust mitigation materials, and oxygen/metal extraction proof-of-concepts.",
        "Space Health: Autonomous medical diagnostics, biosensors, and countermeasure systems protecting human physiology."
      ],
      officialLink: "https://www.asc-csa.gc.ca/eng/funding-programs/programs-funding/leap.asp"
    },
    {
      id: "science-health",
      title: "Lunar Science, Geology & Deep-Space Health",
      subtitle: "Translating Lunar Research to Earth Solutions and Sustainable Living",
      icon: "fa-heart-pulse",
      tag: "SCIENCE & MEDICINE",
      stats: [
        { label: "Analog Crater Sites", value: "Sudbury, Mistastin, Haughton" },
        { label: "Food Challenge", value: "Deep Space Food Challenge" },
        { label: "Medical Focus", value: "Autonomous Remote Care" },
        { label: "Geology Lead", value: "Western Space / McGill" }
      ],
      description: "Canadian planetary scientists at institutions such as Western University (Institute for Earth and Space Exploration) and McGill University are world leaders in impact cratering and meteorite analysis. Canada is also co-leading the Deep Space Food Challenge with NASA, developing modular bioreactors to grow nutritious food on the Moon and in remote northern Canadian communities.",
      contributions: [
        "Planetary Analogues: Using Canada's ancient impact craters (Sudbury Basin, Manicouagan, Mistastin Lake) as training grounds for Apollo and Artemis astronauts.",
        "APXS Heritage: Alpha Particle X-ray Spectrometer instrumentation pioneered on Mars rovers (Curiosity, Opportunity) adapted for lunar surface elemental assays.",
        "Deep Space Food: Compact bio-regenerative food production systems capable of producing fresh proteins and microgreens with minimal water and power.",
        "Connected Health: Automated physiological monitoring providing medical guidance when communication delay with Earth doctors is unavoidable."
      ],
      officialLink: "https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/"
    }
  ]
};

export const LUNAR_MISSIONS_DATABASE = [
  // --- ARTEMIS & MODERN CREWED/GATEWAY ---
  {
    id: "artemis-2",
    name: "Artemis II",
    agency: "NASA / CSA",
    country: "USA / Canada",
    type: "Crewed Lunar Flyby",
    status: "Planned",
    launchDate: "Late 2025 - Early 2026",
    vehicle: "Space Launch System (SLS) Block 1 & Orion Spacecraft",
    destination: "Lunar Free-Return Trajectory (~10,300 km beyond Moon)",
    summary: "The first crewed flight test of the Orion spacecraft launched by the SLS rocket. A 4-person crew, including Canadian Space Agency astronaut Col. Jeremy Hansen, will fly around the Moon in a hybrid free-return trajectory, performing manual handling tests and deep-space life-support validation.",
    crew: ["Reid Wiseman (Commander, NASA)", "Victor Glover (Pilot, NASA)", "Christina Koch (Mission Specialist 1, NASA)", "Jeremy Hansen (Mission Specialist 2, CSA)"],
    keyObjectives: [
      "Confirm all Orion spacecraft life-support, communication, and navigation systems operate safely with crew aboard.",
      "Conduct proximity operations demonstration with the SLS interim cryogenic propulsion stage (ICPS).",
      "Fly ~10,300 km past the lunar far side, the furthest humans will have ever traveled into deep space.",
      "Validate high-speed lunar re-entry thermal protection at 40,000 km/h."
    ],
    technologies: ["SLS Heavy-Lift", "Orion European Service Module (ESM)", "Deep Space Optical Comms", "Hybrid Free-Return Trajectory", "High-Gain Phased Arrays"],
    discoveries: "Paving the path for human landing at the lunar South Pole with verified human systems in deep space.",
    csaInvolvement: "CSA astronaut Jeremy Hansen is serving as Mission Specialist 2, representing Canada's highest-profile human spaceflight in history.",
    officialUrl: "https://www.asc-csa.gc.ca/eng/astronauts/canadian-astronauts/artemis-2/"
  },
  {
    id: "artemis-3",
    name: "Artemis III",
    agency: "NASA / International",
    country: "USA / International Partners",
    type: "Crewed Lunar Landing",
    status: "Planned",
    launchDate: "2026 - 2027",
    vehicle: "SLS Block 1B + Orion + SpaceX Starship HLS",
    destination: "Lunar South Pole (84°S - 90°S Candidate Sites)",
    summary: "The historic return of humans to the surface of the Moon, targeting candidate regions near the lunar South Pole. Two astronauts, including the first woman and first person of color, will conduct multiple EVAs to investigate permanently shadowed water ice and collect polar samples.",
    crew: ["4 Crew (2 Moonwalkers to surface, 2 in Orion orbit)"],
    keyObjectives: [
      "Touch down at an Artemis South Pole landing site (such as Malapert Mountain, Shackleton Rim, or Faustini).",
      "Execute multiple spacewalks using next-generation Axiom Extravehicular Mobility Units (AxEMU).",
      "Prospect, core-drill, and sample volatile-bearing polar regolith inside cold traps.",
      "Demonstrate cislunar orbital rendezvous between Orion and the Human Landing System (Starship HLS)."
    ],
    technologies: ["Starship Human Landing System", "Axiom AxEMU Spacesuits", "Cryogenic Propellant Transfer", "Polar Terrain Relative Navigation", "Core Drilling Tools"],
    discoveries: "Expected to return pristine polar volatiles and determine the origin, age, and distribution of water ice on the Moon.",
    csaInvolvement: "Canadian scientific payloads, rover coordination, and geological training of the astronaut crew at Canadian impact sites.",
    officialUrl: "https://www.nasa.gov/mission/artemis-iii/"
  },
  {
    id: "lunar-gateway",
    name: "Lunar Gateway & Canadarm3",
    agency: "NASA / CSA / ESA / JAXA",
    country: "International Coalition",
    type: "Orbital Space Station",
    status: "Under Construction",
    launchDate: "2027 - 2028 (PPE/HALO Initial Launch)",
    vehicle: "Falcon Heavy / Commercial Heavy Lift",
    destination: "Near-Rectilinear Halo Orbit (NRHO) around the Moon",
    summary: "A permanent modular space station in cislunar orbit serving as a science platform, deep-space communications relay, and staging post for lunar surface expeditions and future Mars transit missions. Outfitted with Canada's smart robotic system, Canadarm3.",
    crew: ["Crew visits up to 4 astronauts for 30–90 days; autonomously operated between missions"],
    keyObjectives: [
      "Provide persistent orbital staging and communication relay for lunar surface expeditions.",
      "Host international deep-space heliophysics, radiation, and space biology laboratories.",
      "Test closed-loop life-support and long-duration systems away from Earth's protective magnetosphere.",
      "Operate Canadarm3 for autonomous station upkeep, payload installation, and spacecraft docking."
    ],
    technologies: ["Canadarm3 AI Robotics", "High-Power Solar Electric Propulsion (50 kW SEP)", "Near-Rectilinear Halo Orbit (NRHO)", "Cislunar Optical Comms", "International Docking System (IDSS)"],
    discoveries: "Will establish continuous human and robotic cislunar infrastructure, proving sustainable multi-decade deep space operations.",
    csaInvolvement: "Canada provides the complete external robotics suite (Canadarm3), autonomous AI operating systems, and receives astronaut mission opportunities.",
    officialUrl: "https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/canadarm3/"
  },
  {
    id: "canadian-lunar-rover",
    name: "Canadian Lunar Rover (Canadensys)",
    agency: "CSA / NASA",
    country: "Canada",
    type: "Lunar Surface Rover",
    status: "Planned",
    launchDate: "2026",
    vehicle: "Commercial Lunar Lander (NASA CLPS)",
    destination: "Lunar South Pole",
    summary: "Canada's flagship lunar surface mission: a ~30 kg micro-rover built by Canadensys Aerospace carrying 6 scientific payloads. It will prospect for water ice, measure polar radiation, and demonstrate survival through the 14-day polar night in sub-cryogenic temperatures.",
    crew: ["Robotic / Autonomous Ground Control"],
    keyObjectives: [
      "Prospect for subsurface water ice and lunar volatiles in the polar regolith.",
      "Demonstrate survival through a full 14-Earth-day lunar night (-200°C to -240°C).",
      "Characterize surface radiation for future astronaut health protocols.",
      "Perform high-resolution stereoscopic imaging and micro-texture analysis."
    ],
    technologies: ["Cryogenic Battery Insulation", "Canadian AI Visual Odometry", "Neutron Ice Spectrometer", "UV Raman Volatiles Detector", "High-Torque Lunar Wheels"],
    discoveries: "Pioneering Canadian mobile ground truth measurements of water ice reserves for future In-Situ Resource Utilization (ISRU).",
    csaInvolvement: "Funded and managed by the Canadian Space Agency under the Lunar Exploration Accelerator Program (LEAP).",
    officialUrl: "https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/canadian-lunar-rover/"
  },
  {
    id: "artemis-1",
    name: "Artemis I",
    agency: "NASA / ESA",
    country: "USA / Europe",
    type: "Uncrewed Test Flight",
    status: "Completed",
    launchDate: "November 16, 2022",
    vehicle: "Space Launch System (SLS) Block 1",
    destination: "Distant Retrograde Orbit (DRO) around the Moon",
    summary: "The inaugural flight of the Space Launch System and uncrewed Orion spacecraft. Traveled 2.25 million kilometers over 25.5 days, entered a high-altitude Distant Retrograde Orbit around the Moon, and splashed down successfully in the Pacific Ocean.",
    crew: ["Uncrewed (Manikins: Commander Moonikin Campos, Helga, and Zohar)"],
    keyObjectives: [
      "Demonstrate SLS launch performance and Orion trans-lunar injection.",
      "Validate Orion systems in deep space environment and stress-test the European Service Module.",
      "Achieve high-velocity atmospheric re-entry at Mach 32 (40,000 km/h) and verify heat shield integrity.",
      "Deploy 10 secondary CubeSat science missions during translunar coast."
    ],
    technologies: ["SLS Core Stage with 4 RS-25 Engines", "Orion Avionics & ECLSS", "European Service Module (ESM)", "Distant Retrograde Orbit Insertion", "Skip Re-entry Trajectory"],
    discoveries: "Proved Orion heat shield survives lunar return temperatures (2,800°C), paving the way for crewed Artemis II.",
    csaInvolvement: "Canadian tracking ground stations and university researchers analyzing secondary CubeSat space biology payloads.",
    officialUrl: "https://www.nasa.gov/mission/artemis-i/"
  },

  // --- MODERN ROBOTIC LANDERS & ROVERS ---
  {
    id: "chandrayaan-3",
    name: "Chandrayaan-3",
    agency: "ISRO",
    country: "India",
    type: "Lander & Rover",
    status: "Completed",
    launchDate: "July 14, 2023 (Touchdown: August 23, 2023)",
    vehicle: "LVM3-M4",
    destination: "South Polar Region (69.37°S, 32.35°E, Shiv Shakti Point)",
    summary: "India made history on August 23, 2023, becoming the first nation to soft-land near the lunar South Pole and the fourth nation overall to land on the Moon. The Vikram lander deployed the Pragyan rover, which confirmed the presence of sulfur, iron, and other elements in the polar regolith.",
    crew: ["Robotic"],
    keyObjectives: [
      "Demonstrate safe and soft landing near the high-latitude lunar South Pole.",
      "Deploy the Pragyan rover to analyze local regolith chemistry and mineralogy.",
      "Measure in-situ lunar thermal conductivity and seismic activity with ChaSTE and ILSA instruments."
    ],
    technologies: ["Hazard Detection and Avoidance Cameras", "Laser Doppler Velocimeter", "Throttleable 800N Engines", "Alpha Particle X-Ray Spectrometer (APXS)", "Laser-Induced Breakdown Spectroscope (LIBS)"],
    discoveries: "Confirmed the presence of Sulfur (S) in-situ without ambiguity; recorded first ground thermal gradient profiles in high-latitude regolith.",
    csaInvolvement: "International deep space tracking and scientific data sharing with international planetary science databases.",
    officialUrl: "https://www.isro.gov.in/Chandrayaan3.html"
  },
  {
    id: "slim-jaxa",
    name: "SLIM (Smart Lander for Investigating Moon)",
    agency: "JAXA",
    country: "Japan",
    type: "Pinpoint Precision Lander",
    status: "Completed",
    launchDate: "September 6, 2023 (Landing: January 19, 2024)",
    vehicle: "H-IIA 202",
    destination: "Shioli Crater Slope (13.3°S, 25.2°E)",
    summary: "JAXA demonstrated game-changing 'pinpoint landing' technology, touching down within approximately 55 meters of its target site on the slope of Shioli crater. Successfully deployed two innovative micro-rovers: LEV-1 (hopping robot) and LEV-2 / SORA-Q (transformable rolling ball).",
    crew: ["Robotic"],
    keyObjectives: [
      "Demonstrate pinpoint landing accuracy under 100 meters (surpassing conventional 10 km ellipses).",
      "Validate vision-based crater-matching navigation during high-speed descent.",
      "Analyze olivine rock exposures ejected from the lunar mantle using a multi-band spectroscopic camera."
    ],
    technologies: ["Vision-Based Autonomous Navigation", "Crushable Aluminum Foam Landing Legs", "Ceramic Throttleable Thruster", "Transformable Micro-Rover (SORA-Q)", "Hop-Mobility Robot (LEV-1)"],
    discoveries: "Achieved the most accurate landing on another celestial body in human history (~55 m), proving that future missions can land precisely on high-value scientific features.",
    csaInvolvement: "Japanese-Canadian space science collaboration on crater geology and comparative vision-based algorithms.",
    officialUrl: "https://global.jaxa.jp/projects/sas/slim/"
  },
  {
    id: "change-6",
    name: "Chang'e 6",
    agency: "CNSA",
    country: "China",
    type: "Lunar Far-Side Sample Return",
    status: "Completed",
    launchDate: "May 3, 2024 (Landing: June 1, 2024; Return: June 25, 2024)",
    vehicle: "Long March 5",
    destination: "Apollo Crater, South Pole-Aitken (SPA) Basin (Lunar Far Side)",
    summary: "A landmark achievement in lunar exploration: the first-ever mission to collect and return physical rock and soil samples from the mysterious far side of the Moon. Collected 1,935.3 grams of deep-mantle impact regolith from the ancient South Pole-Aitken basin.",
    crew: ["Robotic"],
    keyObjectives: [
      "Achieve soft touchdown on the rugged terrain of the lunar far side using the Queqiao-2 relay satellite.",
      "Drill and scoop sub-surface and surface materials from the oldest known impact structure in the solar system.",
      "Ascend autonomously from the lunar far side, execute robotic lunar orbital docking, and return samples to Earth."
    ],
    technologies: ["Queqiao-2 Relay Satellite Comms", "Far-Side Autonomous Ascent & Rendezvous", "Ultrasonic Regolith Drill", "Multi-spectral Imaging", "Atmospheric Skip Re-entry"],
    discoveries: "Returned 1.935 kg of far-side regolith; revealed volcanic basalts dating to 2.8 billion years ago on the far side, confirming distinct asymmetric geological evolution from the near side.",
    csaInvolvement: "International open science access for global research consortiums investigating lunar mantle composition.",
    officialUrl: "http://www.cnsa.gov.cn/"
  },
  {
    id: "im-1-odysseus",
    name: "Intuitive Machines IM-1 (Odysseus)",
    agency: "Intuitive Machines / NASA CLPS",
    country: "USA (Commercial)",
    type: "Commercial Lunar Lander",
    status: "Completed",
    launchDate: "February 15, 2024 (Landing: February 22, 2024)",
    vehicle: "SpaceX Falcon 9",
    destination: "Malapert A Crater (~300 km from South Pole, 80.13°S, 1.44°E)",
    summary: "The first commercial spacecraft in history to land softly on the Moon and the first American lunar touchdown since Apollo 17 in 1972. Carried NASA CLPS payloads and commercial customer instruments, transmitting valuable descent and polar RF data back to Earth.",
    crew: ["Robotic"],
    keyObjectives: [
      "Demonstrate commercial payload delivery under NASA's Commercial Lunar Payload Services (CLPS).",
      "Deploy cryogenic methane/liquid oxygen propulsion in deep space.",
      "Measure radio frequency interference and plasma environment near the South Pole."
    ],
    technologies: ["Liquid Methane / LOX 3D-Printed Engine", "NASA Doppler Lidar for Hazard Detection", "ROLSES Radio Wave Sensor", "Autonomous Terrain Relative Navigation"],
    discoveries: "Demonstrated cryogenic propellants survive cislunar transit; confirmed radio quiet environment on the polar approach for future radio astronomy observatories.",
    csaInvolvement: "Canadensys and Canadian optics components contributed to commercial payloads flown on CLPS missions.",
    officialUrl: "https://www.intuitivemachines.com/lunar-service"
  },
  {
    id: "change-4",
    name: "Chang'e 4 & Yutu-2",
    agency: "CNSA",
    country: "China",
    type: "Far-Side Lander & Rover",
    status: "Active",
    launchDate: "December 7, 2018 (Touchdown: January 3, 2019)",
    vehicle: "Long March 3B",
    destination: "Von Kármán Crater, South Pole-Aitken Basin (Far Side)",
    summary: "The first spacecraft in human history to land on the far side of the Moon. Communicating via the Queqiao-1 relay satellite stationed at Earth-Moon L2, the Yutu-2 rover has been operating for over 5 years, traversing over 1.6 km of pristine far-side terrain.",
    crew: ["Robotic"],
    keyObjectives: [
      "Pioneer the first landing on the lunar hemisphere that perpetually faces away from Earth.",
      "Conduct low-frequency radio astronomy free from Earth's electromagnetic interference.",
      "Analyze sub-surface stratigraphy with Lunar Penetrating Radar down to 40 meters."
    ],
    technologies: ["Earth-Moon L2 Halo Orbit Relay Satellite", "Lunar Penetrating Radar (LPR)", "Visible and Near-Infrared Spectrometer (VNIS)", "Biological Mini-Biosphere Experiment"],
    discoveries: "Mapped multi-layered regolith strata produced by ancient impact ejecta; detected pyroxene and olivine minerals derived from the lunar mantle.",
    csaInvolvement: "Scientific data utilized in comparative lunar radar sounder models worldwide.",
    officialUrl: "http://www.cnsa.gov.cn/"
  },
  {
    id: "lro-nasa",
    name: "Lunar Reconnaissance Orbiter (LRO)",
    agency: "NASA",
    country: "USA",
    type: "Mapping Orbiter",
    status: "Active",
    launchDate: "June 18, 2009",
    vehicle: "Atlas V 401",
    destination: "Polar Lunar Orbit (50 km altitude)",
    summary: "NASA's premier lunar cartographer. Operating continuously for over 15 years, LRO has mapped over 99% of the lunar surface at sub-meter resolution, measured South Pole extreme temperatures (-248°C in Hermite crater), and produced the definitive LOLA 3D topographic models used by all landing missions.",
    crew: ["Robotic"],
    keyObjectives: [
      "Create ultra-high-resolution 3D digital elevation models (DEM) of polar landing sites.",
      "Map permanently shadowed regions (PSRs) and direct solar illumination percentages.",
      "Detect surface and sub-surface water ice using neutron and radar instruments.",
      "Measure space radiation doses for human mission architecture."
    ],
    technologies: ["Lunar Orbiter Laser Altimeter (LOLA)", "LROC Narrow Angle Camera (0.5 m/pixel)", "Diviner Lunar Radiometer", "LAMP Far-Ultraviolet Detector", "Mini-RF Synthetic Aperture Radar"],
    discoveries: "Discovered the coldest recorded spot in the Solar System (-248°C / 25 K in Hermite crater); proved water molecules exist on sunlit regolith; cataloged over 200 lunar pits and lava tube entrances.",
    csaInvolvement: "LOLA and LROC datasets form the foundational scientific bedrock of the Lunar Landing Site Navigator platform.",
    officialUrl: "https://science.nasa.gov/mission/lro/"
  },

  // --- HISTORICAL PIONEER & APOLLO ERA ---
  {
    id: "apollo-11",
    name: "Apollo 11",
    agency: "NASA",
    country: "USA",
    type: "Crewed Landing",
    status: "Completed",
    launchDate: "July 16, 1969 (Touchdown: July 20, 1969)",
    vehicle: "Saturn V",
    destination: "Mare Tranquillitatis (Sea of Tranquility, 0.67°N, 23.47°E)",
    summary: "The historic first crewed lunar landing in human history. Neil Armstrong and Buzz Aldrin stepped onto the lunar surface on July 20, 1969, spending 21 hours and 36 minutes on the Moon and returning 21.55 kg of lunar samples to Earth.",
    crew: ["Neil Armstrong (Commander)", "Buzz Aldrin (Lunar Module Pilot)", "Michael Collins (Command Module Pilot)"],
    keyObjectives: [
      "Perform crewed lunar landing and safely return the crew to Earth.",
      "Deploy Early Apollo Scientific Experiment Package (EASEP).",
      "Collect contingency and bulk regolith samples.",
      "Assess human mobility and work capability in 1/6th gravity."
    ],
    technologies: ["Saturn V 3-Stage Heavy Rocket", "Apollo Lunar Module (Eagle)", "Apollo Command & Service Module (Columbia)", "Passive Seismic Experiment", "Laser Ranging Retroreflector"],
    discoveries: "Confirmed lunar soil consists of basaltic rocks and fine impact-pulverized regolith; proved human capability to walk and work on another world.",
    csaInvolvement: "Canadian engineers from the cancelled Avro Arrow program joined NASA's Space Task Group, playing critical roles in the Apollo Lunar Module design (led by Jim Chamberlin).",
    officialUrl: "https://www.nasa.gov/mission/apollo-11/"
  },
  {
    id: "apollo-8",
    name: "Apollo 8",
    agency: "NASA",
    country: "USA",
    type: "Crewed Lunar Orbit",
    status: "Completed",
    launchDate: "December 21, 1968",
    vehicle: "Saturn V",
    destination: "Lunar Orbit (10 Orbits, ~110 km altitude)",
    summary: "The first crewed spacecraft to leave low Earth orbit, reach another celestial body, orbit the Moon, and witness the 'Earthrise' photograph captured by astronaut William Anders on Christmas Eve 1968.",
    crew: ["Frank Borman (Commander)", "James Lovell (Command Module Pilot)", "William Anders (Lunar Module Pilot)"],
    keyObjectives: [
      "Demonstrate crewed trans-lunar injection, lunar orbit insertion, and trans-Earth injection.",
      "Perform optical reconnaissance and photography of prospective Apollo landing sites.",
      "Evaluate communications and navigation at lunar distances."
    ],
    technologies: ["Saturn V Translunar Injection", "High-Resolution Hasselblad 70mm Cameras", "Deep Space Tracking S-Band Transponder"],
    discoveries: "Captured the iconic 'Earthrise' photograph, transforming humanity's perspective of our fragile home planet.",
    csaInvolvement: "Canadian public broadcast coverage and telecommunication relay links across North America.",
    officialUrl: "https://www.nasa.gov/mission/apollo-8/"
  },
  {
    id: "apollo-15",
    name: "Apollo 15",
    agency: "NASA",
    country: "USA",
    type: "Crewed Landing & Rover",
    status: "Completed",
    launchDate: "July 26, 1971 (Touchdown: July 30, 1971)",
    vehicle: "Saturn V",
    destination: "Hadley Rille / Apennine Mountains (26.13°N, 3.63°E)",
    summary: "The first Apollo 'J-mission' featuring extended three-day lunar surface stays, intensive field geology, and the maiden deployment of the electric Lunar Roving Vehicle (LRV), allowing astronauts to explore 27.9 km across Hadley Rille.",
    crew: ["David Scott (Commander)", "James Irwin (Lunar Module Pilot)", "Alfred Worden (Command Module Pilot)"],
    keyObjectives: [
      "Explore the base of the towering Apennine Mountains and the 300m deep Hadley Rille gorge.",
      "Deploy the Lunar Roving Vehicle for extended scientific mobility.",
      "Sample ancient anorthosite crustal material from early lunar magma ocean differentiation."
    ],
    technologies: ["Lunar Roving Vehicle (LRV)", "Apollo Lunar Surface Experiments Package (ALSEP)", "Deep Core Drill (3m depth)", "SIM Bay Scientific Cameras in CSM"],
    discoveries: "Discovered the famous 'Genesis Rock' (anorthosite sample 15415, age ~4.1 billion years), proving the early Moon was covered by a global magma ocean.",
    csaInvolvement: "Apollo geology training leveraged Canadian impact crater field sites.",
    officialUrl: "https://www.nasa.gov/mission/apollo-15/"
  },
  {
    id: "apollo-17",
    name: "Apollo 17",
    agency: "NASA",
    country: "USA",
    type: "Crewed Landing & Rover",
    status: "Completed",
    launchDate: "December 7, 1972 (Touchdown: December 11, 1972)",
    vehicle: "Saturn V",
    destination: "Taurus-Littrow Valley (20.19°N, 30.77°E)",
    summary: "The final mission of NASA's Apollo program. Astronauts Eugene Cernan and Dr. Harrison 'Jack' Schmitt (the first trained geologist on the Moon) spent 75 hours on the surface, drove 35.7 km, and collected 110.5 kg of geological samples.",
    crew: ["Eugene Cernan (Commander)", "Harrison Schmitt (Lunar Module Pilot / Geologist)", "Ronald Evans (Command Module Pilot)"],
    keyObjectives: [
      "Sample both ancient highland massif rocks and young dark mantle volcanic plains.",
      "Conduct longest total EVA time of the Apollo program (22 hours, 4 minutes).",
      "Deploy Lunar Seismic Profiling and Surface Electrical Properties experiments."
    ],
    technologies: ["Lunar Roving Vehicle", "Traverse Gravimeter Experiment", "Surface Electrical Properties (SEP)", "Mass Spectrometer"],
    discoveries: "Discovered orange volcanic pyroclastic glass beads at Shorty Crater, proving deep explosive fire-fountain volcanism in lunar history.",
    csaInvolvement: "Geological analysis protocols developed in collaboration with international planetary scientists.",
    officialUrl: "https://www.nasa.gov/mission/apollo-17/"
  },
  {
    id: "chandrayaan-1",
    name: "Chandrayaan-1",
    agency: "ISRO / NASA / ESA",
    country: "India / International",
    type: "Orbiter & Impactor",
    status: "Completed",
    launchDate: "October 22, 2008",
    vehicle: "PSLV-C11",
    destination: "Lunar Polar Orbit (100 km)",
    summary: "India's first mission to the Moon and a historic milestone in planetary science. Operating for 312 days, it carried NASA's Moon Mineralogy Mapper (M3), which made the definitive, breakthrough discovery of water molecules (H2O and OH) locked in lunar polar regolith.",
    crew: ["Robotic"],
    keyObjectives: [
      "Generate high-resolution chemical and mineralogical maps of the entire lunar surface.",
      "Deploy the Moon Impact Probe (MIP) into Shackleton Crater at the South Pole.",
      "Search for water ice and hydroxyl signatures across polar cold traps."
    ],
    technologies: ["Moon Mineralogy Mapper (M3 / NASA)", "Moon Impact Probe (MIP)", "Terrain Mapping Camera (TMC)", "Mini-SAR Imaging Radar"],
    discoveries: "Definitively confirmed water molecules (H2O and OH) across polar latitudes, transforming scientific consensus regarding the 'bone dry' Moon.",
    csaInvolvement: "Canadian researchers collaborated on spectroscopic interpretation of polar hydroxyl signatures.",
    officialUrl: "https://www.isro.gov.in/Chandrayaan1.html"
  },
  {
    id: "clementine",
    name: "Clementine (Deep Space Program Science Experiment)",
    agency: "NASA / DoD / BMDO",
    country: "USA",
    type: "Digital Mapping Orbiter",
    status: "Completed",
    launchDate: "January 25, 1994",
    vehicle: "Titan II",
    destination: "Polar Lunar Orbit (400 to 2,940 km)",
    summary: "A joint DoD/NASA mission that created the first complete multi-spectral digital map of the Moon from UV to near-infrared. Clementine's bistatic radar experiment transmitted RF signals into the lunar South Pole, detecting the first hints of water ice deposits in permanent shadow.",
    crew: ["Robotic"],
    keyObjectives: [
      "Map the lunar surface in 11 spectral bands for global mineral composition.",
      "Collect altimetry data using a laser ranging altimeter.",
      "Conduct bistatic radar reflections into South Pole permanently shadowed craters."
    ],
    technologies: ["UV/Visible Camera", "Near-Infrared (NIR) Camera", "Long-Wave Infrared Camera", "Laser Radar (LIDAR) Altimeter", "Bistatic Radar RF Transmission"],
    discoveries: "Provided the first empirical radar evidence of potential water ice in South Pole craters (such as Shackleton).",
    csaInvolvement: "Radar reflection processing models shared with Canadian satellite radar institutions.",
    officialUrl: "https://nssdc.gsfc.nasa.gov/planetary/clementine.html"
  },
  {
    id: "lunar-prospector",
    name: "Lunar Prospector",
    agency: "NASA",
    country: "USA",
    type: "Orbital Geochemistry Explorer",
    status: "Completed",
    launchDate: "January 7, 1998",
    vehicle: "Athena II",
    destination: "Low Lunar Polar Orbit (100 km down to 30 km)",
    summary: "A low-cost Discovery-class mission that mapped the Moon's gravity, magnetic fields, and surface elemental composition. Its Neutron Spectrometer confirmed high concentrations of hydrogen in polar craters, strongly indicating substantial deposits of water ice.",
    crew: ["Robotic"],
    keyObjectives: [
      "Map polar hydrogen abundance as a proxy for water ice deposits.",
      "Map global distribution of key elements: Iron, Titanium, Uranium, Thorium, Potassium, and Silicon.",
      "Construct high-resolution lunar gravity models and detect mascons."
    ],
    technologies: ["Neutron Spectrometer (NS)", "Gamma Ray Spectrometer (GRS)", "Alpha Particle Spectrometer (APS)", "Magnetometer / Electron Reflectometer"],
    discoveries: "Confirmed concentrated hydrogen deposits at both lunar poles, estimating up to billions of metric tons of water ice mixed with regolith.",
    csaInvolvement: "Neutron spectroscopy data incorporated into Canadian mining and resource recovery planning.",
    officialUrl: "https://science.nasa.gov/mission/lunar-prospector/"
  },
  {
    id: "luna-9",
    name: "Luna 9",
    agency: "Soviet Space Program",
    country: "USSR",
    type: "Soft Lander",
    status: "Completed",
    launchDate: "January 31, 1966 (Touchdown: February 3, 1966)",
    vehicle: "Molniya-M",
    destination: "Oceanus Procellarum (7.08°N, 64.37°W)",
    summary: "The first spacecraft to achieve a survivable soft landing on the Moon and the first to transmit close-up photographic panoramas from the lunar surface. Dispelled fears that a lander would sink into deep, quicksand-like lunar dust.",
    crew: ["Robotic"],
    keyObjectives: [
      "Execute the first controlled survivable touchdown on another celestial body.",
      "Transmit close-up panoramic photographs of the lunar surface back to Earth.",
      "Measure surface bearing strength and regolith density."
    ],
    technologies: ["Inflatable Airbag Cushion System", "Mechanical Petal Self-Righting Shell", "Revolving Facsimile Television Camera"],
    discoveries: "Proved lunar soil is firm enough to support spacecraft weight and future human explorers without sinking.",
    csaInvolvement: "Tracked by international radio observatories worldwide.",
    officialUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-006A"
  },
  {
    id: "capstone",
    name: "CAPSTONE",
    agency: "NASA / Advanced Space",
    country: "USA (Commercial Partnership)",
    type: "Pathfinder CubeSat",
    status: "Active",
    launchDate: "June 28, 2022 (Orbit Insertion: November 13, 2022)",
    vehicle: "Electron Rocket & Photon Upper Stage",
    destination: "Near-Rectilinear Halo Orbit (NRHO) around the Moon",
    summary: "A 12-unit microwave-oven-sized CubeSat serving as the pathfinder for the Lunar Gateway. Entered the highly elongated 7-day Near-Rectilinear Halo Orbit, validating orbital stability, propellant budgets, and autonomous cross-link navigation (CAPS).",
    crew: ["Robotic"],
    keyObjectives: [
      "Verify the dynamics and orbital station-keeping fuel costs of the Gateway's NRHO orbit.",
      "Demonstrate autonomous spacecraft-to-spacecraft navigation with LRO (CAPS system).",
      "Validate ballistic lunar transfer (BLT) low-energy transit trajectory."
    ],
    technologies: ["12U Deep-Space CubeSat Bus", "Low-Energy Ballistic Lunar Transfer", "Cislunar Autonomous Positioning System (CAPS)", "Monopropellant Green Propulsion"],
    discoveries: "Proved that the NRHO orbit requires minimal fuel to maintain over long durations, validating Gateway orbit selection.",
    csaInvolvement: "Data utilized by CSA orbital dynamicists planning Canadarm3 payload rendezvous and berthing trajectories.",
    officialUrl: "https://www.nasa.gov/mission/capstone/"
  }
];

export const LUNAR_TIMELINE_ERAS = [
  {
    id: "era-pioneer",
    name: "The Pioneer & Apollo Era",
    period: "1959 – 1976",
    badge: "HUMAN FIRSTS",
    description: "The dawn of lunar exploration fueled by the Cold War Space Race. From the first robotic impacts and soft landings (Luna 2, Luna 9) to the twelve Apollo astronauts walking on the lunar surface and the first robotic sample returns (Luna 16, 24).",
    milestones: [
      { year: "1959", mission: "Luna 2 (USSR)", event: "First human-made object to impact the Moon." },
      { year: "1959", mission: "Luna 3 (USSR)", event: "First photographs of the lunar far side." },
      { year: "1966", mission: "Luna 9 (USSR)", event: "First controlled soft landing on the lunar surface." },
      { year: "1968", mission: "Apollo 8 (NASA)", event: "First crewed spacecraft to orbit the Moon; 'Earthrise'." },
      { year: "1969", mission: "Apollo 11 (NASA)", event: "First humans on the Moon; Armstrong and Aldrin walk on Sea of Tranquility." },
      { year: "1970", mission: "Luna 16 (USSR)", event: "First automated robotic return of lunar regolith samples." },
      { year: "1971", mission: "Apollo 15 (NASA)", event: "First Lunar Roving Vehicle deployed on the surface." },
      { year: "1972", mission: "Apollo 17 (NASA)", event: "Last human Moon landing of the 20th century; first scientist on the Moon." }
    ]
  },
  {
    id: "era-recon",
    name: "The Polar Reconnaissance & Water Ice Era",
    period: "1990 – 2009",
    badge: "GLOBAL MAPPING",
    description: "Orbital remote sensing missions revolutionized planetary science by discovering that the Moon is not completely dry. Clementine, Lunar Prospector, Kaguya, and Chandrayaan-1 mapped polar volatile reservoirs, setting the stage for future South Pole exploration.",
    milestones: [
      { year: "1994", mission: "Clementine (NASA/DoD)", event: "First global multispectral digital map; radar evidence of polar ice." },
      { year: "1998", mission: "Lunar Prospector (NASA)", event: "Neutron spectrometer maps massive polar hydrogen reserves." },
      { year: "2003", mission: "SMART-1 (ESA)", event: "First European lunar mission; demonstrated solar electric ion propulsion." },
      { year: "2007", mission: "Kaguya / SELENE (JAXA)", event: "High-definition 3D cartography and mineral global surveys." },
      { year: "2008", mission: "Chandrayaan-1 (ISRO)", event: "Discovered water molecules (H2O and OH) on the Moon with NASA M3." },
      { year: "2009", mission: "LRO & LCROSS (NASA)", event: "LRO begins persistent polar mapping; LCROSS impact detects 5.5% water ice in Cabeus crater." }
    ]
  },
  {
    id: "era-renaissance",
    name: "The Modern Robotic Renaissance",
    period: "2013 – 2023",
    badge: "AUTONOMOUS ROVERS",
    description: "The return of surface landers and rovers. China's Chang'e program achieved the first far-side landing and returned young volcanic samples, while India achieved the historic first landing in the South Polar region with Chandrayaan-3.",
    milestones: [
      { year: "2013", mission: "Chang'e 3 & Yutu (CNSA)", event: "First lunar soft landing in 37 years since Luna 24." },
      { year: "2019", mission: "Chang'e 4 & Yutu-2 (CNSA)", event: "First landing on the lunar far side (Von Kármán crater)." },
      { year: "2020", mission: "Chang'e 5 (CNSA)", event: "First lunar sample return in 44 years (1.73 kg returned)." },
      { year: "2022", mission: "Artemis I (NASA/ESA)", event: "Flawless uncrewed Orion deep-space flight test around the Moon." },
      { year: "2023", mission: "Chandrayaan-3 (ISRO)", event: "First soft landing in the lunar South Polar region (Shiv Shakti Point)." }
    ]
  },
  {
    id: "era-artemis",
    name: "The Artemis & Sustainable Human Era",
    period: "2024 – 2030+",
    badge: "PERMANENT PRESENCE",
    description: "Humanity returns to the Moon to stay. Powered by international collaboration between NASA, CSA, ESA, and JAXA, and commercial CLPS landers, this era features the Lunar Gateway with Canadarm3, Canadian surface rovers, and long-term South Pole exploration.",
    milestones: [
      { year: "2024", mission: "SLIM (JAXA)", event: "First 100-meter pinpoint precision touchdown on a crater slope." },
      { year: "2024", mission: "IM-1 Odysseus (CLPS)", event: "First commercial lunar lander touchdown near South Pole." },
      { year: "2024", mission: "Chang'e 6 (CNSA)", event: "First-ever sample return from the lunar far side (SPA Basin)." },
      { year: "2025/2026", mission: "Artemis II (NASA/CSA)", event: "First crewed deep-space mission in 50+ years; Canadian astronaut Jeremy Hansen flies." },
      { year: "2026", mission: "Canadian Lunar Rover (CSA)", event: "Canada's first surface rover explores South Pole water ice." },
      { year: "2026/2027", mission: "Artemis III (NASA/Intl)", event: "First humans land near the lunar South Pole, including first woman." },
      { year: "2027/2028", mission: "Lunar Gateway (NASA/CSA)", event: "Deployment of orbital space station outfitted with Canadarm3 smart robotics." },
      { year: "2030+", mission: "Artemis Base Camp", event: "Establishment of permanent surface habitats, pressurized rovers, and ISRU water mining." }
    ]
  }
];

export const LUNAR_TECHNOLOGIES_CATALOG = [
  {
    id: "tech-robotics",
    title: "Space Manipulators & Autonomous Robotics",
    leadExample: "Canadarm3 on the Lunar Gateway",
    agency: "Canadian Space Agency / MDA Space",
    icon: "fa-robot",
    overview: "Robotic arms provide essential servicing, cargo berthing, and structural maintenance in harsh environments. In cislunar space, communication delays require state-of-the-art AI autonomy to inspect, repair, and deploy payloads without continuous human intervention.",
    specs: [
      { label: "Reach", value: "8.5 m Large Arm + Dexterous Arm" },
      { label: "Control", value: "AI Autonomous + Ground Supervised" },
      { label: "Vision", value: "3D LIDAR, Multispectral Optical" }
    ],
    applications: "Autonomous spacecraft docking, EVA astronaut assistance, orbital repair, science payload swaps.",
    csaHighlight: "Canadarm3 is Canada's core contribution to the Gateway, continuing the legendary robotics heritage of Canadarm (Shuttle) and Canadarm2 / Dextre (ISS)."
  },
  {
    id: "tech-rovers",
    title: "Planetary Surface Rovers & Mobility",
    leadExample: "Canadian Lunar Rover / Pragyan / Yutu-2",
    agency: "CSA / Canadensys, ISRO, CNSA, NASA",
    icon: "fa-truck-monster",
    overview: "Lunar rovers traverse rugged crater rims, boulder fields, and deep regolith. Surface rovers must survive extreme temperature swings (+120°C in direct sunlight to -240°C in polar night), low gravity (1/6th g), and electrostatic, razor-sharp abrasive dust.",
    specs: [
      { label: "Class", value: "Micro (30 kg) to Pressurized (5 tonnes)" },
      { label: "Mobility", value: "Independent All-Wheel Drive, Rocker-Bogie" },
      { label: "Night Survival", value: "Passive Phase-Change, RHU / Advanced Batteries" }
    ],
    applications: "Resource prospecting, water-ice coring, regional geological surveys, astronaut transportation.",
    csaHighlight: "The Canadian Lunar Rover built by Canadensys Aerospace is engineered to survive the 14-day polar night and prospect for volatile deposits."
  },
  {
    id: "tech-navigation",
    title: "Terrain Relative Navigation (TRN) & Optical Guidance",
    leadExample: "JAXA SLIM / NASA Lander Vision System",
    agency: "JAXA, NASA, ESA, CSA",
    icon: "fa-crosshairs",
    overview: "GPS does not exist at the Moon. Terrain Relative Navigation (TRN) matches live optical and LIDAR sensor data against stored orbital elevation maps during terminal descent, allowing spacecraft to avoid boulders and slopes and land within meters of their target.",
    specs: [
      { label: "Accuracy", value: "Under 100 meters (SLIM achieved ~55 m)" },
      { label: "Processing", value: "Real-time edge compute FPGA & GPU" },
      { label: "Sensors", value: "Optical Crater Pattern Matching, Flash LIDAR" }
    ],
    applications: "Pinpoint landing on narrow crater rims, hazard avoidance, autonomous rover path planning.",
    csaHighlight: "Canadian research teams funded under LEAP are developing AI vision algorithms capable of navigating in low-angle polar lighting where long shadows confuse traditional edge-detection."
  },
  {
    id: "tech-comms",
    title: "Deep Space Communications & Relay Networks",
    leadExample: "Deep Space Network (DSN) & Lunar Pathfinder",
    agency: "NASA, ESA, CSA",
    icon: "fa-tower-broadcast",
    overview: "Because the Moon's far side and low-elevation South Pole craters cannot view Earth directly, exploration requires orbital communication relays (such as Queqiao, Lunar Pathfinder, and LunaNet architecture) utilizing S-band, Ka-band, and deep-space optical laser links.",
    specs: [
      { label: "RF Bands", value: "S-band, X-band, Ka-band (Gigahertz)" },
      { label: "Optical Comms", value: "Near-Infrared Laser (up to 622 Mbps)" },
      { label: "Network", value: "NASA DSN 34m / 70m Antennas, ESA ESTRACK" }
    ],
    applications: "High-definition video streaming, real-time telemetry, teleoperation of rovers, astronaut voice links.",
    csaHighlight: "Canada utilizes DSN ground stations while developing specialized cislunar software-defined transceivers for Canadian payloads."
  },
  {
    id: "tech-landing",
    title: "Throttleable Rocket Engines & Touchdown Dynamics",
    leadExample: "Vikram Throttleable Thrusters & Starship HLS",
    agency: "NASA, ISRO, SpaceX, JAXA",
    icon: "fa-shuttle-space",
    overview: "Without an atmosphere, parachutes and heat shields cannot slow a lunar lander. Spacecraft must rely on throttleable bipropellant or cryogenic rocket engines with dynamic thrust modulation (between 40% and 100%) to decelerate from 1.7 km/s to 0 m/s for a gentle touchdown.",
    specs: [
      { label: "Propellants", value: "MMH/NTO, LOX/Methane, Liquid H2/LOX" },
      { label: "Gear Stance", value: "Crushable aluminum honeycomb shock struts" },
      { label: "Slope Limit", value: "Nominally < 15° to prevent tip-over" }
    ],
    applications: "Soft touchdown, vertical ascent, multi-destination hops across the lunar surface.",
    csaHighlight: "Landing hazard analysis and gear stability models are simulated within our Lunar Landing Site Navigator platform."
  },
  {
    id: "tech-eclss",
    title: "Environmental Control & Life Support (ECLSS)",
    leadExample: "Gateway ECLSS & Axiom AxEMU Spacesuits",
    agency: "NASA, CSA, ESA, JAXA",
    icon: "fa-lungs",
    overview: "Human survival on the Moon requires closed-loop atmospheric recycling, trace contaminant scrubbers, high-efficiency water reclamation (>98%), thermal loops, and cosmic radiation shielding outside the Van Allen belts.",
    specs: [
      { label: "Atmosphere", value: "10.2 psi / 34% O2 (reduced decompression time)" },
      { label: "Water Recovery", value: ">98% recovery from urine and humidity" },
      { label: "Radiation", value: "Water-wall shielding, storm shelters during SPEs" }
    ],
    applications: "Orion crew cabin, Lunar Gateway crew quarters, surface habitats, pressurized rovers.",
    csaHighlight: "Canada leads research into deep-space biosensors, remote telemedicine, and radiation dosimeters protecting astronaut crews."
  },
  {
    id: "tech-isru",
    title: "In-Situ Resource Utilization (ISRU) & Volatiles",
    leadExample: "Polar Water-Ice Extraction & Regolith Sintering",
    agency: "NASA, CSA, ESA, Commercial",
    icon: "fa-flask-vial",
    overview: "Launching water and fuel from Earth costs thousands of dollars per kilogram. In-Situ Resource Utilization (ISRU) involves extracting water ice from polar craters, purifying it for astronaut consumption, and splitting it into Liquid Hydrogen and Liquid Oxygen for rocket propellant.",
    specs: [
      { label: "Target Resource", value: "H2O Ice (up to 5–10 wt% in South Pole PSRs)" },
      { label: "Thermal Extraction", value: "Solar concentrators, microwave heating, sublimation tents" },
      { label: "Byproduct", value: "Breathing O2, H2 rocket fuel, iron/silicon metals" }
    ],
    applications: "Refueling return landers, sustainable lunar base operation, life-support water resupply.",
    csaHighlight: "Canadian mining technology companies are pioneering automated drills and extraction plants in partnership with the CSA's LEAP initiative."
  }
];

export const FUTURE_ROADMAP_MILESTONES = [
  {
    targetYear: "2025 - 2026",
    mission: "Artemis II Flight",
    agency: "NASA / CSA",
    category: "CREWED FLIGHT",
    statusBadge: "CONFIRMED",
    description: "First crewed circumlunar mission since 1972. Canadian astronaut Jeremy Hansen flies around the Moon on Orion."
  },
  {
    targetYear: "2026",
    mission: "Canadian Lunar Rover (Canadensys)",
    agency: "CSA / NASA CLPS",
    category: "SURFACE PROSPECTING",
    statusBadge: "DEVELOPMENT",
    description: "Canadian micro-rover touches down at the lunar South Pole to prospect for subsurface water ice and test polar night survival."
  },
  {
    targetYear: "2026 - 2027",
    mission: "Artemis III Surface Landing",
    agency: "NASA / SpaceX HLS",
    category: "CREWED SURFACE",
    statusBadge: "CONFIRMED",
    description: "Two astronauts land near the lunar South Pole for multi-day field science and sampling inside permanently shadowed regions."
  },
  {
    targetYear: "2027",
    mission: "Lunar Trailblazer & VIPER CLPS",
    agency: "NASA / Caltech / Astrobotic",
    category: "WATER ICE SCIENCE",
    statusBadge: "DEVELOPMENT",
    description: "High-resolution orbital mapping of water ice forms and distribution across polar micro-cold traps."
  },
  {
    targetYear: "2027 - 2028",
    mission: "Gateway PPE & HALO with Canadarm3",
    agency: "NASA / CSA / ESA / JAXA",
    category: "ORBITAL INFRASTRUCTURE",
    statusBadge: "ASSEMBLY",
    description: "Initial modules of the Lunar Gateway deployed in NRHO orbit; Canadarm3 commissioned for autonomous station servicing."
  },
  {
    targetYear: "2028 - 2029",
    mission: "Artemis IV & Gateway I-Hab",
    agency: "NASA / ESA / JAXA / CSA",
    category: "EXPEDITION & GATEWAY",
    statusBadge: "PLANNED",
    description: "Second crewed lunar landing and delivery of the European International Habitat (I-Hab) to the Lunar Gateway."
  },
  {
    targetYear: "2030+",
    mission: "Artemis Base Camp & Lunar Utility Vehicles",
    agency: "NASA / CSA / International",
    category: "PERMANENT BASE",
    statusBadge: "CONCEPT & ARCHITECTURE",
    description: "Permanent surface habitat at South Pole, Canadian unpressurized and pressurized utility rovers, and pilot ISRU water extraction plants."
  }
];
