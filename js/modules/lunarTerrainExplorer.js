/**
 * LUNAR NAV — 3D Lunar Terrain Explorer Module
 * Integrates NASA Moon Trek (https://trek.nasa.gov/moon/) with interactive coordinate exploration,
 * real-time topographic horizon modeling, ephemeris calculations, and cross-module synchronization.
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import { LUNAR_CRATER_CATALOG } from '../data/craterCatalog.js';
import {
  calculateLocalHorizon,
  calculateCustomLocationMetrics,
  calculateSunElevation,
  calculateEarthElevation
} from '../data/ephemerisData.js';
import { audioSystem } from './audioEffects.js';

export class LunarTerrainExplorerModule {
  constructor(containerId, onLocationChanged) {
    this.container = document.getElementById(containerId);
    this.onLocationChanged = onLocationChanged;

    // Current Observer Coordinates (Defaults to Malapert Mountain Peak)
    this.currentLocation = {
      name: "Malapert Mountain (Peak)",
      latitude: -84.90,
      longitude: 12.90,
      elevation: 5040,
      slope: 4.8,
      isCustom: false,
      siteId: "site-002"
    };

    this.isSidePanelCollapsed = false;
    this.activePreset = "site-002";

    this.render();
  }

  setLocation(site) {
    if (!site) return;
    this.currentLocation = {
      name: site.name,
      latitude: site.latitude,
      longitude: site.longitude,
      elevation: site.elevation || 0,
      slope: site.slope || 5.0,
      isCustom: false,
      siteId: site.id || null
    };
    this.activePreset = site.id || 'custom';
    this.render();
  }

  setCustomCoordinates(lat, lon, elevation = 0, name = "Custom Observer Location") {
    this.currentLocation = {
      name,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      elevation: parseFloat(elevation),
      slope: 5.5, // estimated average
      isCustom: true,
      siteId: null
    };
    this.activePreset = 'custom';
    this.render();

    if (this.onLocationChanged) {
      this.onLocationChanged(this.currentLocation);
    }
  }

  generateMoonTrekUrl() {
    // Standard NASA Moon Trek URL
    return "https://trek.nasa.gov/moon/";
  }

  render() {
    if (!this.container) return;

    const loc = this.currentLocation;
    const metrics = calculateCustomLocationMetrics(loc.latitude, loc.longitude, loc.elevation, 180, 6.8);
    const horizon = metrics.horizon;

    this.container.innerHTML = `
      <div class="moontrek-module-container">
        <!-- Top Control Bar -->
        <div class="moontrek-top-bar glass-panel glow-cyan">
          <div class="top-bar-left">
            <div class="agency-pill">
              <i class="fa-solid fa-satellite-dish cyan"></i>
              <span>NASA JPL MOON TREK</span>
            </div>
            <div class="top-title-wrap">
              <h2>3D Lunar Terrain Explorer</h2>
              <span class="active-loc-subtitle">Active Location: <strong class="cyan">${loc.name}</strong> (${loc.latitude.toFixed(2)}° S, ${loc.longitude.toFixed(2)}° E, +${loc.elevation}m)</span>
            </div>
          </div>

          <div class="top-bar-actions">
            <a href="${this.generateMoonTrekUrl()}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn-hud-primary glow-cyan" 
               title="Open Official NASA Moon Trek Portal in New Tab">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Launch NASA Moon Trek (New Tab)
            </a>

            <button id="toggle-moontrek-panel-btn" class="btn-hud-secondary" title="Toggle Side Analysis Panel for Maximum Map Space">
              <i class="fa-solid ${this.isSidePanelCollapsed ? 'fa-table-columns' : 'fa-maximize'}"></i>
              <span>${this.isSidePanelCollapsed ? 'Show Analysis Panel' : 'Maximize Map'}</span>
            </button>
          </div>
        </div>

        <!-- Main Workspace Grid -->
        <div class="moontrek-workspace ${this.isSidePanelCollapsed ? 'panel-collapsed' : ''}">
          <!-- Left / Center: Interactive Map Viewport -->
          <div class="moontrek-map-pane">
            <!-- Preset Navigation Bar -->
            <div class="map-preset-strip glass-panel">
              <span class="strip-label"><i class="fa-solid fa-map-pin gold"></i> Target Presets:</span>
              <div class="preset-chips-scroll">
                <button class="preset-chip ${this.activePreset === 'site-002' ? 'active' : ''}" data-site-preset="site-002">Malapert Peak</button>
                <button class="preset-chip ${this.activePreset === 'site-001' ? 'active' : ''}" data-site-preset="site-001">Shackleton Rim</button>
                <button class="preset-chip ${this.activePreset === 'site-004' ? 'active' : ''}" data-site-preset="site-004">Mons Mouton</button>
                <button class="preset-chip ${this.activePreset === 'site-005' ? 'active' : ''}" data-site-preset="site-005">Haworth Rim</button>
                <button class="preset-chip ${this.activePreset === 'site-010' ? 'active' : ''}" data-site-preset="site-010">Cabeus (Water Ice)</button>
                <button class="preset-chip ${this.activePreset === 'site-006' ? 'active' : ''}" data-site-preset="site-006">de Gerlache</button>
                <button class="preset-chip ${this.activePreset === 'crater-apollo11' ? 'active' : ''}" data-crater-preset="Apollo 11 Landing Site">Apollo 11</button>
                <button class="preset-chip ${this.activePreset === 'crater-tycho' ? 'active' : ''}" data-crater-preset="Tycho Crater">Tycho</button>
                <button class="preset-chip ${this.activePreset === 'crater-copernicus' ? 'active' : ''}" data-crater-preset="Copernicus Crater">Copernicus</button>
              </div>
            </div>

            <!-- Embedded NASA Moon Trek Viewport Container -->
            <div class="moontrek-iframe-box">
              <iframe 
                id="nasa-moontrek-iframe"
                src="${this.generateMoonTrekUrl()}" 
                title="NASA Moon Trek 3D Lunar Exploration Portal"
                allow="fullscreen; geolocation; accelerometer; gyroscope; xr-spatial-tracking"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads">
              </iframe>

              <!-- NASA Security Policy & Live Launch Overlay Banner -->
              <div class="moontrek-launch-overlay glass-panel">
                <div class="overlay-left">
                  <div class="overlay-icon-wrap">
                    <i class="fa-solid fa-satellite-dish cyan"></i>
                  </div>
                  <div class="overlay-text">
                    <h4>NASA Moon Trek 3D Exploration Portal</h4>
                    <p>
                      NASA Moon Trek provides sub-meter LROC NAC mosaics, LOLA 3D digital elevation models, and layer controls.
                      <em>Note: NASA's web servers enforce security policies (<code class="code-tag">X-Frame-Options: nasa.gov</code>) which may restrict embedded frame viewing in some browsers.</em>
                    </p>
                  </div>
                </div>
                <div class="overlay-right">
                  <a href="${this.generateMoonTrekUrl()}" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     class="btn-hud-primary glow-cyan btn-overlay-launch">
                    <i class="fa-solid fa-up-right-from-square"></i> Open Fullscreen NASA Moon Trek
                  </a>
                  <span class="sub-hint">Includes full 3D terrain rendering & WebGL layers</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side: Coordinate & Terrain Analysis Panel -->
          <div class="moontrek-side-panel" id="moontrek-side-panel">
            <!-- Card 1: Coordinate Selection & Observer Location -->
            <div class="side-panel-card glass-panel">
              <div class="card-header-clean">
                <h4><i class="fa-solid fa-location-crosshairs cyan"></i> Coordinate & Observer Position</h4>
                <span class="data-badge verified"><i class="fa-solid fa-check"></i> LOLA Datum 1,737.4 km</span>
              </div>

              <div class="coords-input-form">
                <div class="input-field-group">
                  <label>Latitude (South / North):</label>
                  <div class="input-row-flex">
                    <input type="number" id="input-observer-lat" min="-90" max="90" step="0.01" value="${loc.latitude.toFixed(2)}">
                    <span class="unit-tag">° ${loc.latitude < 0 ? 'S' : 'N'}</span>
                  </div>
                  <input type="range" id="slider-observer-lat" min="-90" max="90" step="0.1" value="${loc.latitude}">
                </div>

                <div class="input-field-group">
                  <label>Longitude (East / West):</label>
                  <div class="input-row-flex">
                    <input type="number" id="input-observer-lon" min="-180" max="180" step="0.01" value="${loc.longitude.toFixed(2)}">
                    <span class="unit-tag">° ${loc.longitude >= 0 ? 'E' : 'W'}</span>
                  </div>
                  <input type="range" id="slider-observer-lon" min="-180" max="180" step="0.1" value="${loc.longitude}">
                </div>

                <div class="input-field-group">
                  <label>Terrain Altitude (above datum):</label>
                  <div class="input-row-flex">
                    <input type="number" id="input-observer-elev" min="-9000" max="10000" step="10" value="${loc.elevation}">
                    <span class="unit-tag">meters</span>
                  </div>
                  <input type="range" id="slider-observer-elev" min="-6000" max="7000" step="50" value="${loc.elevation}">
                </div>

                <div class="form-btn-actions">
                  <button id="btn-apply-custom-coords" class="btn-hud-primary">
                    <i class="fa-solid fa-bullseye"></i> Set as Observer Location
                  </button>
                  <button id="btn-reset-preset-coords" class="btn-hud-ghost">
                    <i class="fa-solid fa-rotate-left"></i> Reset to Preset
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 2: Topographic Horizon & Visibility Physics -->
            <div class="side-panel-card glass-panel">
              <div class="card-header-clean">
                <h4><i class="fa-solid fa-mountain-sun gold"></i> Terrain Elevation & Horizon Physics</h4>
                <span class="data-badge calculated"><i class="fa-solid fa-calculator"></i> JPL Ephemeris</span>
              </div>

              <div class="horizon-metrics-grid">
                <div class="h-metric-cell">
                  <span class="lbl">Horizon Distance</span>
                  <span class="val cyan">${horizon.horizonDistanceKm} km</span>
                  <span class="sub">Line-of-Sight Envelope</span>
                </div>
                <div class="h-metric-cell">
                  <span class="lbl">Horizon Dip Bonus</span>
                  <span class="val green">+${horizon.horizonDipDeg}°</span>
                  <span class="sub">Depressed Horizon Gain</span>
                </div>
                <div class="h-metric-cell">
                  <span class="lbl">Visible Area</span>
                  <span class="val gold">${horizon.visibleAreaKm2.toLocaleString()} km²</span>
                  <span class="sub">Observable Surface</span>
                </div>
                <div class="h-metric-cell">
                  <span class="lbl">Terrain Slope</span>
                  <span class="val ${loc.slope < 5 ? 'green' : (loc.slope < 8 ? 'gold' : 'hazard-text')}">${loc.slope}°</span>
                  <span class="sub">${loc.slope < 5 ? 'Benign (< 5°)' : 'Moderate Caution'}</span>
                </div>
              </div>

              <div class="physics-explanation-box">
                <h5><i class="fa-solid fa-circle-info"></i> How Elevation Governs Polar Sun & Earth Visibility:</h5>
                <p>
                  Because the Moon has no atmosphere and a smaller radius ($R = 1,737.4\\text{ km}$), every meter of elevation dramatically dips the local horizon by 
                  $$\\theta_{\\text{dip}} = \\sqrt{\\frac{2h}{R}} \\cdot \\frac{180}{\\pi}$$.
                </p>
                <ul>
                  <li><strong>High Massifs (${loc.elevation > 3000 ? 'Active at this location' : 'e.g. Malapert Mountain +5,040m'}):</strong> High elevation lowers the horizon by $+${horizon.horizonDipDeg}°, catching grazing solar rays that pass above lower plains and enabling <strong>quasi-continuous solar power</strong>.</li>
                  <li><strong>Crater Floors (e.g. Shackleton, Haworth):</strong> Surrounding rim walls elevate the effective horizon by $15°$ to $30°$, plunging the interior into eternal darkness ($< 40\\text{ K}$) and blocking direct Earth radio signals.</li>
                </ul>
              </div>
            </div>

            <!-- Card 3: Real-Time Ephemeris Link & Telemetry -->
            <div class="side-panel-card glass-panel">
              <div class="card-header-clean">
                <h4><i class="fa-solid fa-signal cyan"></i> Synchronized Celestial Geometry</h4>
                <span class="data-badge verified">Real-Time SPICE</span>
              </div>

              <div class="ephemeris-sync-list">
                <div class="sync-item">
                  <div class="sync-left">
                    <span class="s-label"><i class="fa-solid fa-sun gold"></i> Sun Elevation Angle:</span>
                    <span class="s-val ${metrics.isSunlit ? 'gold' : 'silver'}">
                      ${metrics.apparentSunElevation > 0 ? `+${metrics.apparentSunElevation}°` : `${metrics.apparentSunElevation}°`}
                    </span>
                  </div>
                  <span class="s-status ${metrics.isSunlit ? 'lit' : 'shadow'}">
                    ${metrics.isSunlit ? 'SUNLIT' : 'SHADOWED'}
                  </span>
                </div>

                <div class="sync-item">
                  <div class="sync-left">
                    <span class="s-label"><i class="fa-solid fa-bolt gold"></i> Estimated Solar Flux:</span>
                    <span class="s-val cyan">${metrics.solarFluxWm2} W/m²</span>
                  </div>
                  <span class="s-sub">At Grazing Polar Vector</span>
                </div>

                <div class="sync-item">
                  <div class="sync-left">
                    <span class="s-label"><i class="fa-solid fa-earth-americas cyan"></i> Earth Apparent Elevation:</span>
                    <span class="s-val ${metrics.isEarthVisible ? 'cyan' : 'hazard-text'}">
                      ${metrics.earth.earthElevationDeg > 0 ? `+${metrics.earth.earthElevationDeg}°` : `${metrics.earth.earthElevationDeg}°`}
                    </span>
                  </div>
                  <span class="s-status ${metrics.isEarthVisible ? 'lit' : 'shadow'}">
                    ${metrics.isEarthVisible ? 'DIRECT LOS' : 'OCCULTED'}
                  </span>
                </div>

                <div class="sync-item">
                  <div class="sync-left">
                    <span class="s-label"><i class="fa-solid fa-tower-broadcast"></i> RF DTE Link Status:</span>
                    <span class="s-val ${metrics.earth.rfLinkMargin ? 'green' : (metrics.isEarthVisible ? 'gold' : 'hazard-text')}">
                      ${metrics.dteStatus}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Module Jump Actions -->
              <div class="cross-module-actions">
                <span class="actions-header">Transfer Location to Analysis Modules:</span>
                <div class="action-buttons-grid">
                  <button class="btn-module-jump" data-jump-tab="sunlight">
                    <i class="fa-solid fa-solar-panel gold"></i> Sunlight Analysis
                  </button>
                  <button class="btn-module-jump" data-jump-tab="comm">
                    <i class="fa-solid fa-satellite-dish cyan"></i> Earth Comm Link
                  </button>
                  <button class="btn-module-jump" data-jump-tab="safety">
                    <i class="fa-solid fa-shield-halved purple"></i> Safety Assessment
                  </button>
                  <button class="btn-module-jump" data-jump-tab="explorer">
                    <i class="fa-solid fa-globe cyan"></i> 3D Globe Explorer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Toggle Side Panel (Maximize Map)
    const toggleBtn = document.getElementById('toggle-moontrek-panel-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isSidePanelCollapsed = !this.isSidePanelCollapsed;
        audioSystem.playClick();
        const workspace = document.querySelector('.moontrek-workspace');
        if (workspace) {
          workspace.classList.toggle('panel-collapsed', this.isSidePanelCollapsed);
        }
        toggleBtn.innerHTML = `
          <i class="fa-solid ${this.isSidePanelCollapsed ? 'fa-table-columns' : 'fa-maximize'}"></i>
          <span>${this.isSidePanelCollapsed ? 'Show Analysis Panel' : 'Maximize Map'}</span>
        `;
      });
    }

    // 2. Preset Chips Click
    this.container.querySelectorAll('[data-site-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const siteId = btn.getAttribute('data-site-preset');
        const site = LUNAR_LANDING_SITES.find(s => s.id === siteId);
        if (site) {
          audioSystem.playTargetLock();
          this.setLocation(site);
          if (this.onLocationChanged) {
            this.onLocationChanged(this.currentLocation);
          }
        }
      });
    });

    this.container.querySelectorAll('[data-crater-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const craterName = btn.getAttribute('data-crater-preset');
        const crater = LUNAR_CRATER_CATALOG.find(c => c.name === craterName);
        if (crater) {
          audioSystem.playTargetLock();
          this.setCustomCoordinates(crater.latitude, crater.longitude, 1200, crater.name);
        }
      });
    });

    // 3. Coordinate Inputs & Sliders Synchronization
    const latInput = document.getElementById('input-observer-lat');
    const latSlider = document.getElementById('slider-observer-lat');
    const lonInput = document.getElementById('input-observer-lon');
    const lonSlider = document.getElementById('slider-observer-lon');
    const elevInput = document.getElementById('input-observer-elev');
    const elevSlider = document.getElementById('slider-observer-elev');

    if (latInput && latSlider) {
      latSlider.addEventListener('input', (e) => {
        latInput.value = parseFloat(e.target.value).toFixed(2);
      });
      latInput.addEventListener('change', (e) => {
        latSlider.value = parseFloat(e.target.value);
      });
    }

    if (lonInput && lonSlider) {
      lonSlider.addEventListener('input', (e) => {
        lonInput.value = parseFloat(e.target.value).toFixed(2);
      });
      lonInput.addEventListener('change', (e) => {
        lonSlider.value = parseFloat(e.target.value);
      });
    }

    if (elevInput && elevSlider) {
      elevSlider.addEventListener('input', (e) => {
        elevInput.value = Math.round(parseFloat(e.target.value));
      });
      elevInput.addEventListener('change', (e) => {
        elevSlider.value = parseFloat(e.target.value);
      });
    }

    // 4. Apply Custom Coordinates Button
    const applyBtn = document.getElementById('btn-apply-custom-coords');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const lat = parseFloat(latInput.value);
        const lon = parseFloat(lonInput.value);
        const elev = parseFloat(elevInput.value);
        audioSystem.playTargetLock();
        this.setCustomCoordinates(lat, lon, elev, `Custom Position (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
      });
    }

    // 5. Reset to Preset
    const resetBtn = document.getElementById('btn-reset-preset-coords');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const defaultSite = LUNAR_LANDING_SITES[1]; // Malapert
        audioSystem.playClick();
        this.setLocation(defaultSite);
        if (this.onLocationChanged) {
          this.onLocationChanged(this.currentLocation);
        }
      });
    }

    // 6. Cross-Module Jump Buttons
    this.container.querySelectorAll('[data-jump-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-jump-tab');
        audioSystem.playClick();
        const tabBtn = document.querySelector(`[data-tab="${targetTab}"]`);
        if (tabBtn) tabBtn.click();
      });
    });
  }
}
