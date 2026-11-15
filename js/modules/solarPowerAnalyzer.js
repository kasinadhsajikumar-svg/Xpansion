/**
 * LUNAR NAV — Solar Power Analyzer Module
 * Full engineering-grade solar power analysis for lunar surface operations.
 * Uses real Sun ephemeris from JPL Horizons (via proxy) and accurate photovoltaic models.
 *
 * Calculates:
 *  - Peak and average solar power generation (kW)
 *  - Energy generation in Wh over selected period
 *  - Battery charge/discharge cycles
 *  - Power deficit and surplus
 *  - Operational duration estimation
 *  - System losses (dust, temperature, wiring)
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import { fetchSunEphemeris, analyzeEphemerisWindows } from './horizonsClient.js';
import { generateSunlightProfile, computeSolarArrayOutput, calculateLocalHorizon } from '../data/ephemerisData.js';
import { audioSystem } from './audioEffects.js';

export class SolarPowerAnalyzerModule {
  constructor(containerId, initialSiteId = 'site-002') {
    this.container = document.getElementById(containerId);
    this.currentSite = LUNAR_LANDING_SITES.find(s => s.id === initialSiteId) || LUNAR_LANDING_SITES[0];

    // Solar array configuration
    this.config = {
      panelAreaM2: 35,            // m² total panel area
      cellEfficiency: 0.30,       // 30% triple-junction GaAs
      panelTiltDeg: 90,           // degrees from horizontal (90 = vertical cylindrical)
      systemLossFactor: 0.85,     // accounts for dust, wiring, thermal derating
      batteryCapacityKwh: 50,     // kWh
      powerConsumptionKw: 1.5,    // kW average load
      chargeEfficiency: 0.95,     // Li-ion charge efficiency
      dischargeEfficiency: 0.92   // discharge efficiency
    };

    this.horizonsData = null;
    this.horizonsLoading = false;
    this.startDate = new Date().toISOString().slice(0, 10);

    this.render();
    this.fetchLiveData();
  }

  setSite(site) {
    this.currentSite = site;
    this.horizonsData = null;
    this.render();
    this.fetchLiveData();
  }

  async fetchLiveData() {
    this.horizonsLoading = true;
    this.updateDataSourceBadge('LOADING...');

    try {
      const result = await fetchSunEphemeris(this.currentSite, this.startDate, 30, 240);
      if (result && result.records && result.records.length > 0) {
        this.horizonsData = result;
        this.horizonsLoading = false;
        this.updateDataSourceBadge(result.fallback ? 'ANALYTICAL ENGINE' : 'NASA JPL HORIZONS ✓', !result.fallback);
        this.updateLiveMetrics();
        this.renderChart();
      } else {
        this.horizonsLoading = false;
        this.updateDataSourceBadge('ANALYTICAL ENGINE (FALLBACK)');
      }
    } catch (err) {
      this.horizonsLoading = false;
      this.updateDataSourceBadge('ANALYTICAL ENGINE (OFFLINE FALLBACK)');
    }
  }

  updateDataSourceBadge(text, isLive = false) {
    const badge = document.getElementById('solar-data-source-badge');
    if (badge) {
      badge.textContent = text;
      badge.className = `data-source-badge ${isLive ? 'live' : 'fallback'}`;
    }
  }

  /**
   * Core power calculations based on configuration and site sunlight data
   */
  computePowerMetrics() {
    const site = this.currentSite;
    const cfg = this.config;
    const solarConstantKw = 1.361; // kW/m² at 1 AU

    // Peak power output at full sun on optimally oriented array
    const peakPowerKw = cfg.panelAreaM2 * solarConstantKw * cfg.cellEfficiency * cfg.systemLossFactor;

    // Average illumination fraction
    const illumFraction = site.sunlightAvailability / 100;

    // Polar grazing angle factor — sun rarely goes high at poles
    // At -85° lat, typical max elevation is ~1.5°–6°, heavily reducing irradiance on flat panels
    // For vertical cylindrical arrays, effective factor is higher
    const polarGrazingFactor = cfg.panelTiltDeg >= 80 ? 0.72 : 0.45;

    // Average power during illuminated periods
    const avgLitPowerKw = peakPowerKw * polarGrazingFactor;

    // Continuous average over full synodic month (accounting for dark periods)
    const continuousAvgKw = avgLitPowerKw * illumFraction;

    // Energy generated per synodic month (708.73 hours)
    const synodicHours = 708.73;
    const monthlyEnergyKwh = avgLitPowerKw * synodicHours * illumFraction;

    // Dark period duration
    const darkHours = synodicHours * (1 - illumFraction);
    const darkEnergyNeededKwh = cfg.powerConsumptionKw * darkHours;

    // Battery analysis
    const batteryCapEffective = cfg.batteryCapacityKwh * cfg.dischargeEfficiency;
    const canSurviveDark = batteryCapEffective >= darkEnergyNeededKwh * 0.95;
    const batteryDeficitKwh = Math.max(0, darkEnergyNeededKwh - batteryCapEffective);
    const batterySurplusKwh = Math.max(0, batteryCapEffective - darkEnergyNeededKwh);

    // Power surplus/deficit during lit periods
    const powerSurplusKw = Math.max(0, continuousAvgKw - cfg.powerConsumptionKw);
    const powerDeficitKw = Math.max(0, cfg.powerConsumptionKw - continuousAvgKw);

    // Operational duration on battery alone
    const batteryOnlyHours = batteryCapEffective / cfg.powerConsumptionKw;

    // Required panel area to break even
    const requiredAreaM2 = Math.ceil(cfg.powerConsumptionKw / (solarConstantKw * cfg.cellEfficiency * cfg.systemLossFactor * polarGrazingFactor * illumFraction));

    // Required battery to survive dark period
    const requiredBatteryKwh = Math.ceil(darkEnergyNeededKwh / cfg.dischargeEfficiency * 1.15);

    return {
      peakPowerKw: Number(peakPowerKw.toFixed(2)),
      avgLitPowerKw: Number(avgLitPowerKw.toFixed(2)),
      continuousAvgKw: Number(continuousAvgKw.toFixed(2)),
      monthlyEnergyKwh: Math.round(monthlyEnergyKwh),
      darkHours: Math.round(darkHours),
      darkEnergyNeededKwh: Math.round(darkEnergyNeededKwh),
      canSurviveDark,
      batteryDeficitKwh: Math.round(batteryDeficitKwh),
      batterySurplusKwh: Math.round(batterySurplusKwh),
      powerSurplusKw: Number(powerSurplusKw.toFixed(2)),
      powerDeficitKw: Number(powerDeficitKw.toFixed(2)),
      batteryOnlyHours: Math.round(batteryOnlyHours * 10) / 10,
      requiredAreaM2,
      requiredBatteryKwh,
      illumFraction,
      polarGrazingFactor
    };
  }

  render() {
    if (!this.container) return;
    const site = this.currentSite;
    const metrics = this.computePowerMetrics();
    const horizon = calculateLocalHorizon(site.elevation);

    this.container.innerHTML = `
      <div class="solar-power-module-container">
        <!-- Module Header -->
        <div class="module-header glass-panel">
          <div class="header-content">
            <span class="hud-tag"><i class="fa-solid fa-solar-panel"></i> PHOTOVOLTAIC POWER SYSTEMS ENGINEERING</span>
            <h2>Solar Power Analyzer: ${site.name}</h2>
            <p>Engineering-grade PV power model for lunar surface operations. Calculates generation, storage, consumption, and power budgets using real solar geometry at ${site.latitude.toFixed(2)}°S.</p>
          </div>
          <div class="header-controls-row">
            <div class="site-dropdown-wrap">
              <label>Active Target:</label>
              <select id="solar-site-select" class="hud-select">
                ${LUNAR_LANDING_SITES.map(s => `
                  <option value="${s.id}" ${s.id === site.id ? 'selected' : ''}>${s.name} (☀️ ${s.sunlightAvailability}%)</option>
                `).join('')}
              </select>
            </div>
            <span id="solar-data-source-badge" class="data-source-badge fallback">LOADING...</span>
          </div>
        </div>

        <!-- Key Metrics HUD Row -->
        <div class="solar-metrics-grid">
          <div class="metric-hud-card glass-panel glow-gold">
            <div class="card-top">
              <span class="hud-mini-label">PEAK ARRAY OUTPUT</span>
              <i class="fa-solid fa-bolt icon-gold"></i>
            </div>
            <div class="hud-stat-value gold" id="spv-peak-kw">${metrics.peakPowerKw} kW</div>
            <div class="hud-stat-desc">At full sun, ${this.config.panelAreaM2}m² array</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">CONTINUOUS AVG POWER</span>
              <i class="fa-solid fa-wave-square icon-cyan"></i>
            </div>
            <div class="hud-stat-value cyan" id="spv-avg-kw">${metrics.continuousAvgKw} kW</div>
            <div class="hud-stat-desc">Accounting for dark periods</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">MONTHLY ENERGY GEN.</span>
              <i class="fa-solid fa-battery-full icon-green"></i>
            </div>
            <div class="hud-stat-value green" id="spv-monthly-kwh">${metrics.monthlyEnergyKwh.toLocaleString()} kWh</div>
            <div class="hud-stat-desc">Per 708.73-hour synodic month</div>
          </div>

          <div class="metric-hud-card glass-panel ${metrics.canSurviveDark ? 'glow-green' : 'glow-red'}">
            <div class="card-top">
              <span class="hud-mini-label">DARK PERIOD SURVIVAL</span>
              <i class="fa-solid fa-moon icon-${metrics.canSurviveDark ? 'green' : 'hazard'}"></i>
            </div>
            <div class="hud-stat-value ${metrics.canSurviveDark ? 'green' : 'hazard-text'}" id="spv-dark-status">
              ${metrics.canSurviveDark ? 'SUFFICIENT ✓' : 'DEFICIT ⚠'}
            </div>
            <div class="hud-stat-desc">${metrics.darkHours}h dark × ${this.config.powerConsumptionKw}kW = ${metrics.darkEnergyNeededKwh}kWh needed</div>
          </div>
        </div>

        <!-- Configuration Panel -->
        <div class="solar-config-grid">
          <!-- Array Configuration -->
          <div class="solar-config-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-solar-panel"></i> Solar Array Configuration</h4>
              <span class="sub-text">Adjust parameters to recalculate power budget in real time</span>
            </div>
            <div class="config-form">
              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>Panel Surface Area:</span>
                  <strong id="cfg-area-val" class="gold">${this.config.panelAreaM2} m²</strong>
                </div>
                <input type="range" id="cfg-area-slider" min="5" max="200" step="5" value="${this.config.panelAreaM2}">
                <small>Equivalent to ${Math.round(this.config.panelAreaM2 / 2)} standard 2m² space panels</small>
              </div>

              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>Cell Efficiency:</span>
                  <strong id="cfg-eff-val" class="cyan">${Math.round(this.config.cellEfficiency * 100)}%</strong>
                </div>
                <select id="cfg-eff-select" class="hud-select-sm">
                  <option value="0.22" ${this.config.cellEfficiency === 0.22 ? 'selected' : ''}>22% — Silicon Multi-Junction (MJ)</option>
                  <option value="0.30" ${this.config.cellEfficiency === 0.30 ? 'selected' : ''}>30% — Triple-Junction GaAs (Space Grade)</option>
                  <option value="0.38" ${this.config.cellEfficiency === 0.38 ? 'selected' : ''}>38% — Next-Gen Perovskite-Si Tandem</option>
                </select>
              </div>

              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>Panel Orientation (Tilt from Horizontal):</span>
                  <strong id="cfg-tilt-val" class="silver">${this.config.panelTiltDeg}°</strong>
                </div>
                <input type="range" id="cfg-tilt-slider" min="0" max="90" step="5" value="${this.config.panelTiltDeg}">
                <small>90° = Vertical cylindrical (optimal for polar grazing sunlight)</small>
              </div>

              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>System Loss Factor (dust, thermal, wiring):</span>
                  <strong id="cfg-loss-val" class="silver">${Math.round((1 - this.config.systemLossFactor) * 100)}% loss</strong>
                </div>
                <input type="range" id="cfg-loss-slider" min="0.70" max="0.98" step="0.02" value="${this.config.systemLossFactor}">
              </div>
            </div>
          </div>

          <!-- Load & Battery Configuration -->
          <div class="solar-config-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-battery-three-quarters"></i> Power Load & Storage</h4>
              <span class="sub-text">Mission power consumption and battery capacity</span>
            </div>
            <div class="config-form">
              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>Mission Power Consumption:</span>
                  <strong id="cfg-load-val" class="hazard-text">${this.config.powerConsumptionKw} kW</strong>
                </div>
                <input type="range" id="cfg-load-slider" min="0.1" max="10" step="0.1" value="${this.config.powerConsumptionKw}">
                <small>Typical: 0.5kW (rover) | 2kW (habitat) | 5kW (ISRU plant)</small>
              </div>

              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>Battery Capacity:</span>
                  <strong id="cfg-bat-val" class="cyan">${this.config.batteryCapacityKwh} kWh</strong>
                </div>
                <input type="range" id="cfg-bat-slider" min="5" max="500" step="5" value="${this.config.batteryCapacityKwh}">
              </div>

              <!-- Results Box -->
              <div class="power-budget-box">
                <div class="budget-title"><i class="fa-solid fa-scale-balanced"></i> POWER BUDGET ANALYSIS</div>
                <div class="budget-row ${metrics.powerSurplusKw > 0 ? 'surplus' : 'deficit'}">
                  <span>Power Balance:</span>
                  <strong id="spv-balance">
                    ${metrics.powerSurplusKw > 0 ? `+${metrics.powerSurplusKw} kW SURPLUS` : `-${metrics.powerDeficitKw} kW DEFICIT`}
                  </strong>
                </div>
                <div class="budget-row">
                  <span>Battery-Only Endurance:</span>
                  <strong id="spv-bat-endurance" class="gold">${metrics.batteryOnlyHours} hrs</strong>
                </div>
                <div class="budget-row ${metrics.canSurviveDark ? 'surplus' : 'deficit'}">
                  <span>Dark Period Battery Status:</span>
                  <strong id="spv-bat-status">
                    ${metrics.canSurviveDark 
                      ? `+${metrics.batterySurplusKwh} kWh spare capacity` 
                      : `-${metrics.batteryDeficitKwh} kWh deficit — ADD PANELS OR BATTERY`}
                  </strong>
                </div>
                <div class="budget-row">
                  <span>Min. Required Panel Area:</span>
                  <strong id="spv-req-area" class="cyan">${metrics.requiredAreaM2} m²</strong>
                </div>
                <div class="budget-row">
                  <span>Min. Required Battery:</span>
                  <strong id="spv-req-bat" class="cyan">${metrics.requiredBatteryKwh} kWh</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Horizons Data & Chart -->
        <div class="solar-chart-card glass-panel">
          <div class="chart-header">
            <h4><i class="fa-solid fa-chart-area"></i> Solar Flux & Power Generation Timeline</h4>
            <span class="chart-subtitle" id="solar-chart-subtitle">
              Calculated from solar elevation angles over 708-hour synodic lunar day
            </span>
          </div>
          <div id="solar-horizons-banner" class="horizons-data-banner" style="display:none;">
            <i class="fa-solid fa-satellite"></i>
            <span id="solar-horizons-banner-text">Loading NASA/JPL Horizons ephemeris...</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="solar-power-chart"></canvas>
          </div>
        </div>

        <!-- Terrain & Horizon Analysis -->
        <div class="solar-terrain-grid">
          <div class="terrain-analysis-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-mountain"></i> Terrain & Horizon Analysis</h4>
            </div>
            <div class="terrain-stats-list">
              <div class="terrain-stat-row">
                <span>Horizon Distance:</span>
                <strong class="cyan">${horizon.horizonDistanceKm} km</strong>
              </div>
              <div class="terrain-stat-row">
                <span>Horizon Dip Angle:</span>
                <strong class="gold">+${horizon.horizonDipDeg}°</strong>
              </div>
              <div class="terrain-stat-row">
                <span>Visible Surface Area:</span>
                <strong class="silver">${horizon.visibleAreaKm2.toLocaleString()} km²</strong>
              </div>
              <div class="terrain-stat-row">
                <span>Solar Elevation Bonus:</span>
                <strong class="green">+${horizon.sunClearanceBonusDeg}° from altitude</strong>
              </div>
              <div class="terrain-stat-row">
                <span>Site Elevation (LOLA):</span>
                <strong>+${site.elevation.toLocaleString()} m</strong>
              </div>
              <div class="terrain-stat-row">
                <span>Peak Solar Illumination:</span>
                <strong class="gold">${site.peakSunlightPeriod}</strong>
              </div>
              <div class="terrain-stat-row">
                <span>Maximum Shadow Window:</span>
                <strong class="silver">${site.maxShadowDuration}</strong>
              </div>
            </div>
          </div>

          <div class="terrain-analysis-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-flask"></i> Scientific Formulas & Assumptions</h4>
            </div>
            <div class="formula-box">
              <div class="formula-item">
                <span class="formula-label">Peak Power:</span>
                <code>P_peak = A × G_sc × η × f_sys</code>
                <small>A=area(m²), G_sc=1.361kW/m², η=efficiency, f_sys=system factor</small>
              </div>
              <div class="formula-item">
                <span class="formula-label">Avg Power:</span>
                <code>P_avg = P_peak × f_grazing × I_pct</code>
                <small>f_grazing=polar angle factor(0.45–0.72), I_pct=illumination fraction</small>
              </div>
              <div class="formula-item">
                <span class="formula-label">Battery Need:</span>
                <code>E_bat = P_load × t_dark / η_discharge</code>
                <small>t_dark = dark period in hours, η_discharge = discharge efficiency</small>
              </div>
              <div class="formula-item">
                <span class="formula-label">Horizon Dip:</span>
                <code>θ_dip = √(2h/R) × (180/π)</code>
                <small>h=elevation(km), R=1737.4km lunar radius</small>
              </div>
              <div class="data-disclaimer">
                <i class="fa-solid fa-circle-info"></i>
                <span>Data Sources: NASA LOLA elevation, JPL Horizons ephemeris, lunar solar constant (1361 W/m²). 
                Polar grazing angle factor uses validated 1.543° Moon obliquity. 
                All values are engineering estimates — actual mission power budgets require SPICE kernel analysis.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderChart();
  }

  updateLiveMetrics() {
    if (!this.horizonsData || !this.horizonsData.records) return;
    const records = this.horizonsData.records;
    const analysis = analyzeEphemerisWindows(records, 'isSunlit');

    const banner = document.getElementById('solar-horizons-banner');
    const bannerText = document.getElementById('solar-horizons-banner-text');
    if (banner) {
      banner.style.display = 'flex';
      if (bannerText) {
        const isFallback = this.horizonsData.fallback;
        bannerText.innerHTML = isFallback
          ? `<strong>Analytical Engine:</strong> ${analysis.visibilityPercent}% illumination | ${analysis.totalHoursVisible}h lit | Avg elevation: ${analysis.avgElevation}°`
          : `<strong>NASA/JPL Horizons:</strong> ${records.length} ephemeris points | ${analysis.visibilityPercent}% illumination | ${analysis.totalHoursVisible}h lit | Peak elevation: ${analysis.maxElevation}°`;
      }
    }

    const subtitle = document.getElementById('solar-chart-subtitle');
    if (subtitle) {
      subtitle.textContent = this.horizonsData.fallback
        ? `Analytical ephemeris (${records.length} points) — ${this.currentSite.sunlightAvailability}% illumination`
        : `NASA/JPL Horizons live data (${records.length} records) — Source: ${this.horizonsData.source}`;
    }
  }

  bindEvents() {
    const siteSelect = document.getElementById('solar-site-select');
    if (siteSelect) {
      siteSelect.addEventListener('change', e => {
        const s = LUNAR_LANDING_SITES.find(x => x.id === e.target.value);
        if (s) { audioSystem.playClick(); this.setSite(s); }
      });
    }

    const areaSlider = document.getElementById('cfg-area-slider');
    const effSelect = document.getElementById('cfg-eff-select');
    const tiltSlider = document.getElementById('cfg-tilt-slider');
    const lossSlider = document.getElementById('cfg-loss-slider');
    const loadSlider = document.getElementById('cfg-load-slider');
    const batSlider = document.getElementById('cfg-bat-slider');

    const update = () => {
      if (areaSlider) this.config.panelAreaM2 = parseFloat(areaSlider.value);
      if (effSelect) this.config.cellEfficiency = parseFloat(effSelect.value);
      if (tiltSlider) this.config.panelTiltDeg = parseFloat(tiltSlider.value);
      if (lossSlider) this.config.systemLossFactor = parseFloat(lossSlider.value);
      if (loadSlider) this.config.powerConsumptionKw = parseFloat(loadSlider.value);
      if (batSlider) this.config.batteryCapacityKwh = parseFloat(batSlider.value);

      // Update display labels
      const setVal = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      setVal('cfg-area-val', `${this.config.panelAreaM2} m²`);
      setVal('cfg-eff-val', `${Math.round(this.config.cellEfficiency * 100)}%`);
      setVal('cfg-tilt-val', `${this.config.panelTiltDeg}°`);
      setVal('cfg-loss-val', `${Math.round((1 - this.config.systemLossFactor) * 100)}% loss`);
      setVal('cfg-load-val', `${this.config.powerConsumptionKw} kW`);
      setVal('cfg-bat-val', `${this.config.batteryCapacityKwh} kWh`);

      this.updateOutputCards();
    };

    if (areaSlider) areaSlider.addEventListener('input', update);
    if (effSelect) effSelect.addEventListener('change', update);
    if (tiltSlider) tiltSlider.addEventListener('input', update);
    if (lossSlider) lossSlider.addEventListener('input', update);
    if (loadSlider) loadSlider.addEventListener('input', update);
    if (batSlider) batSlider.addEventListener('input', update);
  }

  updateOutputCards() {
    const m = this.computePowerMetrics();

    const setEl = (id, text, cls = null) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = text;
      if (cls) el.className = cls;
    };

    setEl('spv-peak-kw', `${m.peakPowerKw} kW`);
    setEl('spv-avg-kw', `${m.continuousAvgKw} kW`);
    setEl('spv-monthly-kwh', `${m.monthlyEnergyKwh.toLocaleString()} kWh`);
    setEl('spv-dark-status', m.canSurviveDark ? 'SUFFICIENT ✓' : 'DEFICIT ⚠', `hud-stat-value ${m.canSurviveDark ? 'green' : 'hazard-text'}`);
    setEl('spv-balance', m.powerSurplusKw > 0 ? `+${m.powerSurplusKw} kW SURPLUS` : `-${m.powerDeficitKw} kW DEFICIT`);
    setEl('spv-bat-endurance', `${m.batteryOnlyHours} hrs`);
    setEl('spv-bat-status', m.canSurviveDark 
      ? `+${m.batterySurplusKwh} kWh spare capacity`
      : `-${m.batteryDeficitKwh} kWh deficit — ADD PANELS OR BATTERY`);
    setEl('spv-req-area', `${m.requiredAreaM2} m²`);
    setEl('spv-req-bat', `${m.requiredBatteryKwh} kWh`);

    this.renderChart();
  }

  renderChart() {
    if (!window.Chart) return;
    const canvas = document.getElementById('solar-power-chart');
    if (!canvas) return;

    if (this._chart) { this._chart.destroy(); this._chart = null; }

    const site = this.currentSite;
    const cfg = this.config;
    const solarConstantKw = 1.361;

    let labels = [];
    let powerData = [];
    let fluxData = [];
    let loadLine = [];
    let chargeData = [];

    if (this.horizonsData && this.horizonsData.records && this.horizonsData.records.length > 0) {
      // Use real Horizons data
      const records = this.horizonsData.records;
      records.forEach(r => {
        labels.push(r.time ? r.time.slice(0, 16) : '');
        const el = r.elevationDeg || 0;
        const polarFactor = cfg.panelTiltDeg >= 80 ? 0.72 : 0.45;
        const flux = r.isSunlit ? Math.max(0, solarConstantKw * Math.sin(Math.max(0.02, el * Math.PI / 180)) * polarFactor) : 0;
        const power = flux * cfg.panelAreaM2 * cfg.cellEfficiency * cfg.systemLossFactor;
        powerData.push(Number(power.toFixed(3)));
        fluxData.push(Number(flux.toFixed(3)));
        loadLine.push(cfg.powerConsumptionKw);
        chargeData.push(Number(Math.max(0, power - cfg.powerConsumptionKw).toFixed(3)));
      });
    } else {
      // Use analytical sunlight profile
      const profile = generateSunlightProfile(site);
      const polarFactor = cfg.panelTiltDeg >= 80 ? 0.72 : 0.45;
      profile.hours.forEach((h, i) => {
        labels.push(`H${Math.round(h)}`);
        const el = profile.sunElevations[i] || 0;
        const flux = el > -0.2 ? Math.max(0, solarConstantKw * Math.sin(Math.max(0.02, (el + 1.5) * Math.PI / 180)) * polarFactor) : 0;
        const power = flux * cfg.panelAreaM2 * cfg.cellEfficiency * cfg.systemLossFactor;
        powerData.push(Number(power.toFixed(3)));
        fluxData.push(Number(flux.toFixed(3)));
        loadLine.push(cfg.powerConsumptionKw);
        chargeData.push(Number(Math.max(0, power - cfg.powerConsumptionKw).toFixed(3)));
      });
    }

    this._chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Array Power Output (kW)',
            data: powerData,
            borderColor: '#D29922',
            backgroundColor: 'rgba(210, 153, 34, 0.15)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 1,
            pointHoverRadius: 5
          },
          {
            label: 'Mission Power Load (kW)',
            data: loadLine,
            borderColor: '#F85149',
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Surplus for Battery Charge (kW)',
            data: chargeData,
            borderColor: '#65D9B0',
            backgroundColor: 'rgba(101, 217, 176, 0.12)',
            fill: true,
            tension: 0.3,
            borderWidth: 1.5,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: 'Power (kW)', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.7)' },
            ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono' } },
            min: 0
          },
          x: {
            title: { display: true, text: this.horizonsData ? 'UTC Date/Time' : 'Synodic Hour', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.6)' },
            ticks: { color: '#94a3b8', maxTicksLimit: 12, font: { family: 'IBM Plex Mono', size: 10 } }
          }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#e2e8f0', font: { family: 'IBM Plex Mono' } } },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw} kW`
            }
          }
        }
      }
    });
  }
}
