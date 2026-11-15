/**
 * LUNAR NAV — Sunlight & Solar Energy Analysis Module
 * Validated solar geometry calculations, synodic day illumination timeline,
 * grazing-angle solar flux modeling, PSR cold-trap evaluation, and PV power sizing.
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import {
  calculateSunElevation,
  generateSunlightProfile,
  computeSolarArrayOutput
} from '../data/ephemerisData.js';
import { audioSystem } from './audioEffects.js';

export class SunlightAnalysisModule {
  constructor(containerId, initialSiteId = 'site-002') {
    this.container = document.getElementById(containerId);
    this.currentSite = LUNAR_LANDING_SITES.find(s => s.id === initialSiteId) || LUNAR_LANDING_SITES[0];
    this.chart = null;
    this.currentHour = 180; // current hour in 708-hour cycle
    this.arrayArea = 35; // m^2
    this.cellEfficiency = 0.30; // 30% triple-junction GaAs space PV

    this.render();
  }

  setSite(site) {
    this.currentSite = site;
    this.render();
  }

  render() {
    if (!this.container) return;

    const site = this.currentSite;
    const powerOutput = computeSolarArrayOutput(this.arrayArea, this.cellEfficiency, site.sunlightAvailability);
    const currentElevation = calculateSunElevation(site.latitude, site.longitude, this.currentHour, -1.54);
    const isLit = currentElevation > -0.2;

    this.container.innerHTML = `
      <div class="sunlight-module-container">
        <!-- Module Header -->
        <div class="module-header glass-panel">
          <div class="header-content">
            <span class="hud-tag"><i class="fa-solid fa-sun"></i> SOLAR EPHEMERIS & ILLUMINATION</span>
            <h2>Sunlight & Solar Energy Analysis: ${site.name}</h2>
            <p>Evaluating solar geometry at ${site.latitude.toFixed(2)}° S, grazing horizon elevation, and continuous power generation feasibility.</p>
          </div>
          <div class="site-dropdown-wrap">
            <label>Active Target:</label>
            <select id="sunlight-site-select" class="hud-select">
              ${LUNAR_LANDING_SITES.map(s => `
                <option value="${s.id}" ${s.id === site.id ? 'selected' : ''}>${s.name} (${s.sunlightAvailability}% Sun)</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Metric HUD Cards Row -->
        <div class="sunlight-metrics-grid">
          <div class="metric-hud-card glass-panel glow-gold">
            <div class="card-top">
              <span class="hud-mini-label">ANNUAL ILLUMINATION</span>
              <i class="fa-solid fa-sun icon-gold"></i>
            </div>
            <div class="hud-stat-value gold">${site.sunlightAvailability}%</div>
            <div class="hud-stat-desc">${site.peakSunlightPeriod}</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">MAX SHADOW DURATION</span>
              <i class="fa-solid fa-moon icon-silver"></i>
            </div>
            <div class="hud-stat-value silver">${site.maxShadowDuration}</div>
            <div class="hud-stat-desc">Battery endurance design constraint</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">PSR COLD TRAP PROXIMITY</span>
              <i class="fa-solid fa-snowflake icon-cyan"></i>
            </div>
            <div class="hud-stat-value cyan">${site.psrProximityKm} km</div>
            <div class="hud-stat-desc">&lt; 40 Kelvin volatile cold trap</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">SOLAR REGIME CLASSIFICATION</span>
              <i class="fa-solid fa-mountain-sun icon-gold"></i>
            </div>
            <div class="hud-stat-value green">
              ${site.sunlightAvailability >= 85 ? 'PEAK OF ETERNAL LIGHT CANDIDATE' : 'HIGH-EXTENT POLAR HIGHLAND'}
            </div>
            <div class="hud-stat-desc">Sub-solar declination: -1.54°</div>
          </div>
        </div>

        <!-- Interactive Timeline & Scrubber -->
        <div class="timeline-scrubber-card glass-panel">
          <div class="scrubber-header">
            <h4><i class="fa-solid fa-clock-rotate-left"></i> Synodic Lunar Day Simulation (708.73 Earth Hours / 29.53 Days)</h4>
            <span class="current-epoch-badge">
              Hour <strong id="epoch-hour-val" class="gold">${this.currentHour}</strong> / 708.7 h
              (<span id="epoch-day-val">${(this.currentHour / 24).toFixed(1)} Earth Days</span>)
            </span>
          </div>

          <div class="scrubber-controls">
            <input type="range" id="sun-hour-slider" min="0" max="708" step="2" value="${this.currentHour}">
            <div class="scrubber-markers">
              <span>0h (Lunar Noon)</span>
              <span>177h (Terminator Sunset)</span>
              <span>354h (Lunar Midnight)</span>
              <span>531h (Terminator Sunrise)</span>
              <span>708h (Full Cycle)</span>
            </div>
          </div>

          <div class="telemetry-readout-strip">
            <div class="readout-item">
              <span class="lbl">Instantaneous Sun Elevation:</span>
              <span id="instant-sun-el" class="val ${isLit ? 'gold' : 'silver'}">
                ${currentElevation > 0 ? `+${currentElevation.toFixed(2)}°` : `${currentElevation.toFixed(2)}°`}
              </span>
            </div>
            <div class="readout-item">
              <span class="lbl">Horizon Illumination Status:</span>
              <span id="instant-sun-status" class="val ${isLit ? 'status-lit' : 'status-shadow'}">
                ${isLit ? 'SUNLIT (DIRECT GRAZING SOLAR FLUX)' : 'SHADOWED BY SURROUNDING TOPOGRAPHY'}
              </span>
            </div>
            <div class="readout-item">
              <span class="lbl">Instantaneous Solar Flux:</span>
              <span id="instant-sun-flux" class="val cyan">
                ${isLit ? `${Math.round(1361 * Math.sin(Math.max(0.02, (currentElevation + 2) * Math.PI / 180)))} W/m²` : '0 W/m² (Occulted)'}
              </span>
            </div>
          </div>
        </div>

        <!-- Sunlight Chart -->
        <div class="sunlight-chart-card glass-panel">
          <div class="chart-header">
            <h4><i class="fa-solid fa-chart-line"></i> Solar Elevation Angle Relative to Local Horizon</h4>
            <span class="chart-subtitle">Calculated with 1.54° Lunar Obliquity & LOLA Horizon Masking</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="sunlight-elevation-chart"></canvas>
          </div>
        </div>

        <!-- Solar Power Calculator & PSR Science Columns -->
        <div class="sunlight-calc-grid">
          <!-- Solar Array Calculator -->
          <div class="calc-card glass-panel">
            <div class="calc-header">
              <h4><i class="fa-solid fa-solar-panel"></i> Solar Power Array Sizing Calculator</h4>
              <span class="calc-subtitle">Vertical Cylindrical Space Array Sizing</span>
            </div>

            <div class="calc-form">
              <div class="input-row">
                <label>Array Surface Area (m²):</label>
                <div class="input-slider-val">
                  <input type="range" id="array-area-slider" min="5" max="150" step="5" value="${this.arrayArea}">
                  <span id="array-area-display" class="calc-val">${this.arrayArea} m²</span>
                </div>
              </div>

              <div class="input-row">
                <label>Photovoltaic Efficiency:</label>
                <select id="cell-efficiency-select" class="hud-select-sm">
                  <option value="0.30" selected>30% (Triple-Junction GaAs Space Grade)</option>
                  <option value="0.22">22% (Silicon Space Cells)</option>
                  <option value="0.38">38% (Next-Gen Perovskite Tandem)</option>
                </select>
              </div>

              <div class="calc-results-box">
                <div class="result-row">
                  <span>Peak Solar Electric Output:</span>
                  <strong id="calc-peak-kw" class="gold">${powerOutput.peakKw} kW</strong>
                </div>
                <div class="result-row">
                  <span>Continuous Average Output:</span>
                  <strong id="calc-avg-kw" class="cyan">${powerOutput.continuousAvgKw} kW</strong>
                </div>
                <div class="result-row">
                  <span>Estimated Battery Storage Needed:</span>
                  <strong id="calc-battery-kwh" class="silver">${powerOutput.batteryStorageKwhNeeded} kWh</strong>
                </div>
                <div class="result-row">
                  <span>Estimated Lunar Night Duration:</span>
                  <strong id="calc-shadow-hrs" class="gold">${powerOutput.maxShadowHours} Earth Hours</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Permanently Shadowed Regions (PSR) Analysis -->
          <div class="psr-card glass-panel">
            <div class="calc-header">
              <h4><i class="fa-solid fa-icicles"></i> Permanently Shadowed Region (PSR) Science</h4>
              <span class="calc-subtitle">Cryogenic Volatiles & In-Situ Water Ice Trapping</span>
            </div>

            <div class="psr-content">
              <p>Because the Moon's spin axis is tilted only 1.54°, deep impact crater floors near the South Pole never see direct sunlight. Temperatures inside these cold traps drop to 30–50 Kelvin, acting as cryogenic cosmic refrigerators for over 2 billion years.</p>
              
              <div class="psr-stats-list">
                <div class="psr-stat-item">
                  <span class="psr-label">Target Cold Trap Distance:</span>
                  <span class="psr-val cyan">${site.psrProximityKm} km</span>
                </div>
                <div class="psr-stat-item">
                  <span class="psr-label">Equilibrium Temperature:</span>
                  <span class="psr-val purple">35 K to 45 K (-238°C)</span>
                </div>
                <div class="psr-stat-item">
                  <span class="psr-label">Volatiles Preserved:</span>
                  <span class="psr-val gold">H₂O, CO, NH₃, CH₄, Organics</span>
                </div>
                <div class="psr-stat-item">
                  <span class="psr-label">Water Ice Weight %:</span>
                  <span class="psr-val green">5.5 ± 1.5 wt% (LCROSS Analogs)</span>
                </div>
              </div>

              <div class="psr-note-box">
                <i class="fa-solid fa-lightbulb"></i>
                <span><strong>Traverse Strategy:</strong> A rover stationed on ${site.name} can operate in continuous sunlight to recharge batteries, then make short 2–4 km sorties into adjacent permanent shadows using headlights and isotopic heating units.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderChart();
  }

  bindEvents() {
    // Target site dropdown
    const select = document.getElementById('sunlight-site-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const siteId = e.target.value;
        const newSite = LUNAR_LANDING_SITES.find(s => s.id === siteId);
        if (newSite) {
          audioSystem.playClick();
          this.currentSite = newSite;
          this.render();
        }
      });
    }

    // Timeline slider
    const hourSlider = document.getElementById('sun-hour-slider');
    const hourVal = document.getElementById('epoch-hour-val');
    const dayVal = document.getElementById('epoch-day-val');
    const instantEl = document.getElementById('instant-sun-el');
    const instantStatus = document.getElementById('instant-sun-status');
    const instantFlux = document.getElementById('instant-sun-flux');

    if (hourSlider) {
      hourSlider.addEventListener('input', (e) => {
        this.currentHour = parseFloat(e.target.value);
        if (hourVal) hourVal.textContent = this.currentHour;
        if (dayVal) dayVal.textContent = `${(this.currentHour / 24).toFixed(1)} Earth Days`;

        const el = calculateSunElevation(this.currentSite.latitude, this.currentSite.longitude, this.currentHour, -1.54);
        const isLit = el > -0.2;

        if (instantEl) {
          instantEl.textContent = el > 0 ? `+${el.toFixed(2)}°` : `${el.toFixed(2)}°`;
          instantEl.className = `val ${isLit ? 'gold' : 'silver'}`;
        }
        if (instantStatus) {
          instantStatus.textContent = isLit ? 'SUNLIT (DIRECT GRAZING SOLAR FLUX)' : 'SHADOWED BY SURROUNDING TOPOGRAPHY';
          instantStatus.className = `val ${isLit ? 'status-lit' : 'status-shadow'}`;
        }
        if (instantFlux) {
          const flux = isLit ? Math.round(1361 * Math.sin(Math.max(0.02, (el + 2) * Math.PI / 180))) : 0;
          instantFlux.textContent = isLit ? `${flux} W/m²` : '0 W/m² (Occulted)';
        }
      });
    }

    // Solar Array Slider
    const areaSlider = document.getElementById('array-area-slider');
    const areaDisplay = document.getElementById('array-area-display');
    const effSelect = document.getElementById('cell-efficiency-select');

    const updateCalc = () => {
      this.arrayArea = parseFloat(areaSlider.value);
      this.cellEfficiency = parseFloat(effSelect.value);
      if (areaDisplay) areaDisplay.textContent = `${this.arrayArea} m²`;

      const out = computeSolarArrayOutput(this.arrayArea, this.cellEfficiency, this.currentSite.sunlightAvailability);
      const peakEl = document.getElementById('calc-peak-kw');
      const avgEl = document.getElementById('calc-avg-kw');
      const batEl = document.getElementById('calc-battery-kwh');
      const shdEl = document.getElementById('calc-shadow-hrs');

      if (peakEl) peakEl.textContent = `${out.peakKw} kW`;
      if (avgEl) avgEl.textContent = `${out.continuousAvgKw} kW`;
      if (batEl) batEl.textContent = `${out.batteryStorageKwhNeeded} kWh`;
      if (shdEl) shdEl.textContent = `${out.maxShadowHours} Earth Hours`;
    };

    if (areaSlider) areaSlider.addEventListener('input', updateCalc);
    if (effSelect) effSelect.addEventListener('change', updateCalc);
  }

  renderChart() {
    if (!window.Chart) return;
    const canvas = document.getElementById('sunlight-elevation-chart');
    if (!canvas) return;

    const profile = generateSunlightProfile(this.currentSite);

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: profile.hours.map(h => `${h}h`),
        datasets: [
          {
            label: 'Solar Elevation Angle (°)',
            data: profile.sunElevations,
            borderColor: '#D29922',
            backgroundColor: 'rgba(210, 153, 34, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 5
          },
          {
            label: 'Local Horizon Datum (0°)',
            data: profile.hours.map(() => 0),
            borderColor: 'rgba(248, 81, 73, 0.75)',
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: 'Degrees Above Horizon (°)', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.7)' },
            ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono' } }
          },
          x: {
            title: { display: true, text: 'Synodic Cycle Hour (Earth Hours)', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.6)' },
            ticks: { color: '#94a3b8', maxTicksLimit: 12, font: { family: 'IBM Plex Mono' } }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#e2e8f0', font: { family: 'IBM Plex Mono' } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}°`
            }
          }
        }
      }
    });
  }
}
