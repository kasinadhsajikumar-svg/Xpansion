# LUNAR NAV — Lunar Landing Site Navigator
### *Explore. Navigate. Land.*

A comprehensive, futuristic, interactive web-based lunar mission planning platform engineered for planetary researchers, space technology engineers, and Artemis mission planners to explore the Moon, identify candidate landing sites, and analyze landing-site suitability around the lunar South Pole.

---

## 🚀 Live Demo & Quick Launch

The application includes a zero-dependency local Node.js server:

```bash
node server.js
```

Then open your browser at:
👉 **`http://localhost:8080`**

---

## 🌕 System Architecture & Key Modules

### 1. Home Mission Control Dashboard
- **NASA Telemetry Header**: Real-time UTC clock, Mission Elapsed Time (MET) counter, active DSN Ground Station tracking (Goldstone, Madrid, Canberra), and Sub-solar / Sub-Earth coordinates.
- **Cinematic Moon Hero**: Tagline, mission overview, and quick-launch buttons.
- **Active Target Telemetry Card**: Instant overview of the selected candidate landing site (suitability index, slope, sunlight, Earth LOS).
- **Mission Planning Suite Dock**: Quick navigation to all major modules.

### 2. Interactive 3D Moon Explorer & LROC QuickMap GIS (`Three.js`)
- **Realistic 3D Lunar Model**: High-polygon sphere with custom high-resolution procedural regolith albedo, impact rays (Tycho, Copernicus), and normal/bump maps for realistic 3D terminator shadows.
- **NASA LROC / Intuitive Machines QuickMap Integration**:
  - Live South Pole polar stereographic GIS viewer (`proj=10`) with Earth Shadow enabled and Layer Stack `3314` (LROC WAC + NAC sub-meter photography & LOLA elevation).
  - Mode Switcher: **3D Moon Globe**, **LROC QuickMap GIS (Polar)**, and **Split View (3D + QuickMap)**.
  - Direct deep-links for candidate landing locations to inspect sub-meter boulder fields.
- **Multi-Spectral Visualization Layers**:
  1. *Optical Albedo*: Realistic visible-light regolith, lunar maria, and highlands.
  2. *LOLA Topography*: NASA Lunar Orbiter Laser Altimeter false-color hypsometric elevation palette (-9 km purple to +10 km red/gold).
  3. *PSR Cold Traps*: Vivid neon cryogenic overlay marking Permanently Shadowed Regions (< 40 Kelvin).
  4. *Slope Hazard Heatmap*: Green safe zones (< 5°), amber caution (5°–10°), and red hazard (> 12° steep walls).
- **Interactive 3D Landing Markers**: 3D beacon pins with animated pulsing radar rings positioned at exact spherical coordinates.
- **Raycaster Interaction**: Hover over markers for quick telemetry tooltips; click markers to trigger smooth camera fly-to animations and lock target telemetry.
- **Interactive Sun Position Control**: Sweeps the day/night terminator across crater rims in real time.
- **Camera Presets**: South Pole (90°S), Global Orbit, Equator, Malapert, and Shackleton views.
- **Real-Time Coordinate HUD**: Tracks mouse coordinates over the lunar surface.

### 3. 3D Lunar Terrain Explorer (NASA Moon Trek Integration)
- **NASA Moon Trek Embedded 3D Portal**: Integrates NASA's official Moon Trek interactive platform (`https://trek.nasa.gov/moon/`).
- **Resilient Fallback Architecture**: Includes intelligent launcher overlay for direct full-screen exploration in an unconstrained tab when NASA's `X-Frame-Options: nasa.gov` CSP restricts embedded frames.
- **Target Presets & Quick Jump**: Instantly explore Malapert Mountain, Shackleton Crater, Mons Mouton, Haworth, Cabeus, Apollo 11, Tycho, Copernicus, and Clavius.
- **Custom Coordinate Observer Form**: Input any latitude ($-90^\circ\text{ to }+90^\circ$), longitude ($-180^\circ\text{ to }+180^\circ$), and altitude ($-9,000\text{m to }+10,000\text{m}$) relative to the LOLA 1,737.4 km lunar datum.
- **Topographic Horizon & Visibility Physics**:
  - Geometric Horizon Distance: $d_{\text{horiz}} = \sqrt{2 \cdot R \cdot h + h^2}$.
  - Horizon Dip Bonus: $\theta_{\text{dip}} = \sqrt{\frac{2h}{R}} \cdot \frac{180}{\pi}$.
  - Real-time Sun and Earth apparent elevations, line-of-sight status, and polar mountain solar catchment physics.
- **Cross-Module Ephemeris Synchronization**: Synchronizes user-selected coordinates across all analysis modules (Sunlight Analysis, Earth Comm, Landing Safety, Comparison, and 3D Moon Globe).

### 4. Candidate Site Selection & Catalog
- **10 Validated NASA South Pole Regions**:
  1. *Shackleton Crater Rim* (Candidate 001)
  2. *Malapert Mountain / Peak* (Candidate 004)
  3. *Connecting Ridge* (Candidate 002)
  4. *Mons Mouton Plateau* (Candidate 007 / VIPER Area)
  5. *Haworth Crater Rim Crest* (Candidate 003)
  6. *de Gerlache Crater Rim 1* (Candidate 005)
  7. *Nobile Crater Rim 1* (Candidate 008)
  8. *Faustini Crater Rim Plateau* (Candidate 011)
  9. *Leibnitz Plateau* (Candidate 012)
  10. *Cabeus Crater Rim* (Candidate 006 / LCROSS Water Ice Site)
- **Live Search & Multi-Constraint Filtering**:
  - Filter by maximum slope (3° to 15°).
  - Filter by minimum sunlight availability (0% to 85%).
  - Filter by minimum Direct-to-Earth (DTE) line-of-sight (0% to 90%).
  - Sort by Suitability Score, Flattest Slope, Highest Elevation, Sunlight, Earth LOS, or Science Value.
- **Deep Telemetry Inspector Modal**: Detailed geological epochs, surface roughness (Hurst exponent), boulder abundance, landing ellipse tolerance, mission advantages, and identified risks.

### 4. Multi-Site Comparison Dashboard (MCDA)
- **Interactive Site Selection**: Compare 2 to 4 candidate sites simultaneously.
- **6-Axis Multi-Criteria Radar Chart (`Chart.js`)**:
  - Slope Safety
  - Illumination
  - Direct Earth LOS
  - Science Merit (Volatile ice proximity)
  - Hazard Margin
  - Flat Landing Area
- **Configurable Mission Priority Weights**:
  - Sliders for Terrain Slope Safety, Solar Power, Direct Earth Link, Science / Volatiles, and Boulder Hazard Margin.
- **Dynamic Score Recalculation & Bar Chart**: Live updates based on user priority sliders.
- **Explainable AI-Style Recommendation Engine**: Generates human-readable mission justifications explaining why the top candidate is recommended and highlighting key trade-offs.
- **Scientific & Engineering Telemetry Matrix Table**.

### 5. Sunlight & Solar Energy Analysis
- **Solar Geometry Engine**: Computes solar elevation angles taking into account the Moon's 1.543° obliquity to the ecliptic and LOLA horizon masking.
- **Synodic Lunar Day Timeline Scrubber**: Drag from Hour 0 to Hour 708.7 (29.53 Earth days) to inspect instantaneous solar elevation, horizon illumination status, and grazing solar flux ($W/m^2$).
- **Solar Elevation Curve Line Chart**.
- **Photovoltaic Power Sizing Calculator**: Computes peak electric output (kW), continuous average output, required battery storage (kWh), and maximum shadow endurance for vertical cylindrical space arrays.
- **Permanently Shadowed Region (PSR) Science Breakdown**: Details temperature stability (30–45 K), volatile retention (LCROSS analogs: $H_2O$, $CO$, $NH_3$), and sortie planning.

### 6. Direct-To-Earth Communication Analysis
- **Libration Geometrical Model**: Simulates the 27.21-day draconic month libration wobble ($\pm 6.7^\circ$ in latitude, $\pm 7.9^\circ$ in longitude) and LOLA altitude horizon-dip bonus.
- **Libration Timeline Scrubber (Day 0 to 27.2)**: Instantaneous Earth elevation and RF link status.
- **Earth Elevation Line Chart**: Distinguishes optimal RF link (> 0.8°), grazing multipath hazard zone (0° to 0.8°), and occultation blackout (< 0°).
- **Communication Protocol Selector**: S-Band (TT&C), X-Band (Payload Data), and Ka-Band (HD Astronaut Video).
- **Orbital Relay Architecture**: Explains Lunar Gateway Near-Rectilinear Halo Orbit (NRHO), L2 halo constellations, and local surface UHF repeaters.

### 7. Landing Safety Analyzer
- **Aerospace Touchdown Dynamics**: Evaluates slope tip-over probability based on lander center-of-gravity, touchdown descent velocity, and landing gear stance.
- **Customizable Spacecraft Parameters**: Footprint diameter (m), tip-over angle tolerance (°), touchdown velocity (m/s), and Terrain Relative Navigation (TRN) accuracy radius (m).
- **Poisson Boulder Strike Probability**: Diviner rock abundance modeling for obstacles taller than landing gear stroke.
- **Composite Safety Index & Flight Verdict**: Automatic Go / Caution / No-Go flight status banner.
- **LOLA Micro-Topography Slope Distribution Bar Chart**.

### 8. Mission Report Dossier Generator
- **Formal NASA / Artemis Mission Assessment Dossier**: Includes executive summary, geodetic coordinates, LOLA elevation, illumination profile, comms telemetry, and safety certifications.
- **Export Options**:
  - One-click PDF download via `html2pdf.js` with print styling fallback.
  - Export structured JSON dataset.
  - Export CSV telemetry matrix.
  - Print-ready CSS formatting (`@media print`).

### 9. Mission Control Audio System
- **Web Audio API Synthesizer**: Pure programmatic sound synthesis (telemetry clicks, dual-tone target locks, radar sweeps, mode change swooshes, and alerts).
- No external audio files needed; includes an audio mute/unmute toggle.

---

## 🛠 Technology Stack

- **HTML5 & Semantic Markup**: NASA mission-control layout, accessibility, and print support.
- **CSS3 Modern Styling**: Dark navy / black glassmorphism (`backdrop-filter`), glowing telemetry accents, CSS Grid / Flexbox, and responsive design.
- **JavaScript (ES6 Modules)**: Modular architecture (`app.js`, `moon3d.js`, `siteSelection.js`, `comparison.js`, `sunlightAnalysis.js`, `earthCommAnalysis.js`, `safetyAnalyzer.js`, `missionReport.js`, `audioEffects.js`).
- **Three.js (r128)**: 3D WebGL rendering, OrbitControls, dynamic canvas textures, normal/bump maps, and Raycaster hit detection.
- **Chart.js (v4.4.1)**: Multi-axis Radar charts, dynamic comparison Bar charts, and timeline Line charts.
- **NASA Lunar Datasets**: LOLA elevation, Diviner thermal radiometer, LAMP volatile mapping, and SPICE ephemeris geometry.

---

## 📂 Project Structure

```
Lunar Landing Site Navigator/
├── index.html                   # Master single-page application
├── server.js                    # Zero-dependency local Node.js server
├── README.md                    # Documentation & user guide
├── css/
│   ├── main.css                 # Variables, typography, NASA theme & base layout
│   ├── components.css           # Glassmorphism panels, cards, buttons, badges, modals
│   └── telemetry.css            # HUD overlays, 3D viewport controls, charts & dossier styles
└── js/
    ├── app.js                   # Application coordinator & event bus
    ├── data/
    │   ├── lunarSites.js        # 10 NASA Artemis candidate regions & telemetry
    │   ├── ephemerisData.js     # Validated solar & Earth libration ephemeris models
    │   └── craterCatalog.js     # Lunar crater catalog (South Pole & global)
    └── modules/
        ├── moon3d.js            # Three.js 3D Moon explorer & multi-spectral layers
        ├── siteSelection.js     # Interactive catalog, search & filtering
        ├── comparison.js        # Multi-site MCDA comparison & Radar chart
        ├── sunlightAnalysis.js  # Solar geometry & synodic illumination timeline
        ├── earthCommAnalysis.js # Earth libration DTE communications & link budgets
        ├── safetyAnalyzer.js    # Touchdown dynamics & slope tip-over analyzer
        ├── missionReport.js     # NASA dossier generator, PDF/JSON/CSV export
        └── audioEffects.js      # Web Audio API telemetry sound synthesizer
```
