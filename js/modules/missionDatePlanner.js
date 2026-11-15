/**
 * LUNAR NAV — Mission Date Planner Module
 * Identify optimal mission windows based on:
 *  - User-selected mission start date, duration, and coordinates
 *  - Solar illumination windows (from JPL Horizons or analytical engine)
 *  - Earth communication windows (libration cycle)
 *  - Combined mission suitability score per time interval
 *
 * Displays:
 *  - Interactive date/coordinate picker
 *  - Solar illumination timeline
 *  - Earth visibility timeline
 *  - Combined opportunity windows chart
 *  - Recommended launch windows ranked by suitability
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import { fetchSunEphemeris, fetchEarthEphemeris, analyzeEphemerisWindows } from './horizonsClient.js';
import { calculateSunElevation, calculateEarthElevation } from '../data/ephemerisData.js';
import { audioSystem } from './audioEffects.js';

export class MissionDatePlannerModule {
  constructor(containerId, initialSiteId = 'site-002') {
    this.container = document.getElementById(containerId);
    this.currentSite = LUNAR_LANDING_SITES.find(s => s.id === initialSiteId) || LUNAR_LANDING_SITES[0];

    // Date range configuration
    const now = new Date();
    this.startDate = now.toISOString().slice(0, 10);
    const endDate = new Date(now.getTime() + 90 * 86400000);
    this.endDate = endDate.toISOString().slice(0, 10);
    this.missionDurationDays = 14;
    this.stepHours = 12;

    // Custom coordinates
    this.useCustomCoords = false;
    this.customLat = this.currentSite.latitude;
    this.customLon = this.currentSite.longitude;
    this.customElevKm = (this.currentSite.elevation || 0) / 1000;

    this.sunData = null;
    this.earthData = null;
    this.loading = false;
    this.windows = [];

    this.render();
    this.fetchData();
  }

  setSite(site) {
    this.currentSite = site;
    if (!this.useCustomCoords) {
      this.customLat = site.latitude;
      this.customLon = site.longitude;
      this.customElevKm = (site.elevation || 0) / 1000;
    }
    this.sunData = null;
    this.earthData = null;
    this.windows = [];
    this.render();
    this.fetchData();
  }

  get activeLat() { return this.useCustomCoords ? this.customLat : this.currentSite.latitude; }
  get activeLon() { return this.useCustomCoords ? this.customLon : this.currentSite.longitude; }
  get activeElevKm() { return this.useCustomCoords ? this.customElevKm : (this.currentSite.elevation || 0) / 1000; }

  async fetchData() {
    this.loading = true;
    this.updateStatus('Fetching ephemeris data from NASA/JPL Horizons...');

    const synthSite = {
      latitude: this.activeLat,
      longitude: this.activeLon,
      elevation: this.activeElevKm * 1000
    };

    const daysAhead = Math.ceil((new Date(this.endDate) - new Date(this.startDate)) / 86400000);

    try {
      const [sunResult, earthResult] = await Promise.all([
        fetchSunEphemeris(synthSite, this.startDate, daysAhead, this.stepHours * 60),
        fetchEarthEphemeris(synthSite, this.startDate, daysAhead, this.stepHours * 60)
      ]);

      this.sunData = sunResult;
      this.earthData = earthResult;

      this.loading = false;
      this.computeWindows();
      this.updateStatus(
        (sunResult.fallback ? '⚡ Analytical Engine' : '🛰️ NASA/JPL Horizons') +
        ` | ${(sunResult.records || []).length} sun records, ${(earthResult.records || []).length} earth records`
      );
      this.renderResults();
      this.renderChart();
    } catch (err) {
      this.loading = false;
      this.computeWindowsAnalytical();
      this.updateStatus('⚡ Analytical Engine (JPL Horizons offline)');
      this.renderResults();
      this.renderChart();
    }
  }

  updateStatus(text) {
    const el = document.getElementById('planner-status-text');
    if (el) el.textContent = text;
  }

  computeWindows() {
    const sunRecs = (this.sunData && this.sunData.records) || [];
    const earthRecs = (this.earthData && this.earthData.records) || [];

    // Merge by index (they should be same timestamps)
    const count = Math.max(sunRecs.length, earthRecs.length);
    this.windows = [];

    for (let i = 0; i < count; i++) {
      const sun = sunRecs[i] || {};
      const earth = earthRecs[i] || {};

      const isSunlit = sun.isSunlit || (sun.elevationDeg > 0);
      const isEarthVisible = earth.isVisible || (earth.elevationDeg > 0);
      const earthRfOk = earth.rfMarginOk || (earth.elevationDeg > 0.8);

      // Combined suitability score (0-100)
      let score = 0;
      if (isSunlit) score += 50;
      if (isEarthVisible) score += 30;
      if (earthRfOk) score += 20;

      this.windows.push({
        time: sun.time || earth.time || '',
        sunEl: sun.elevationDeg || 0,
        earthEl: earth.elevationDeg || 0,
        isSunlit,
        isEarthVisible,
        earthRfOk,
        score
      });
    }
  }

  computeWindowsAnalytical() {
    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();
    const stepMs = this.stepHours * 3600000;
    this.windows = [];

    const synodicMs = 708.73 * 3600000;

    for (let t = start; t <= end; t += stepMs) {
      const date = new Date(t);
      const hourInSynodic = (t % synodicMs) / 3600000;
      const dayInLib = ((t % (27.21 * 86400000)) / 86400000);

      const sunEl = calculateSunElevation(this.activeLat, this.activeLon, hourInSynodic, -1.54);
      const earthRes = calculateEarthElevation(this.activeLat, this.activeLon, dayInLib, this.activeElevKm * 1000);

      const isSunlit = sunEl > 0;
      const isEarthVisible = earthRes.isVisible;
      const earthRfOk = earthRes.rfLinkMargin;

      let score = 0;
      if (isSunlit) score += 50;
      if (isEarthVisible) score += 30;
      if (earthRfOk) score += 20;

      this.windows.push({
        time: date.toISOString().slice(0, 16).replace('T', ' '),
        sunEl: Number(sunEl.toFixed(2)),
        earthEl: earthRes.earthElevationDeg,
        isSunlit,
        isEarthVisible,
        earthRfOk,
        score
      });
    }
  }

  /**
   * Find optimal landing windows where both sun and Earth are visible
   */
  findOptimalWindows() {
    const windows = this.windows;
    if (windows.length === 0) return [];

    const minDurationSteps = Math.ceil(24 / this.stepHours); // at least 24h window
    const optimal = [];
    let currentWindow = null;

    for (let i = 0; i < windows.length; i++) {
      const w = windows[i];
      const isFavorable = w.isSunlit && w.isEarthVisible;

      if (isFavorable) {
        if (!currentWindow) {
          currentWindow = { start: w.time, startIdx: i, scoreSum: w.score, count: 1 };
        } else {
          currentWindow.scoreSum += w.score;
          currentWindow.count++;
        }
        currentWindow.end = w.time;
        currentWindow.endIdx = i;
      } else {
        if (currentWindow && currentWindow.count >= minDurationSteps) {
          currentWindow.avgScore = Math.round(currentWindow.scoreSum / currentWindow.count);
          currentWindow.durationHours = currentWindow.count * this.stepHours;
          currentWindow.maxSunEl = Math.max(...windows.slice(currentWindow.startIdx, currentWindow.endIdx + 1).map(x => x.sunEl));
          currentWindow.maxEarthEl = Math.max(...windows.slice(currentWindow.startIdx, currentWindow.endIdx + 1).map(x => x.earthEl));
          optimal.push(currentWindow);
        }
        currentWindow = null;
      }
    }
    // Handle window at end of data
    if (currentWindow && currentWindow.count >= minDurationSteps) {
      currentWindow.avgScore = Math.round(currentWindow.scoreSum / currentWindow.count);
      currentWindow.durationHours = currentWindow.count * this.stepHours;
      currentWindow.maxSunEl = Math.max(...windows.slice(currentWindow.startIdx, currentWindow.endIdx + 1).map(x => x.sunEl));
      currentWindow.maxEarthEl = Math.max(...windows.slice(currentWindow.startIdx, currentWindow.endIdx + 1).map(x => x.earthEl));
      optimal.push(currentWindow);
    }

    return optimal.sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);
  }

  render() {
    if (!this.container) return;
    const site = this.currentSite;

    this.container.innerHTML = `
      <div class="planner-module-container">
        <!-- Module Header -->
        <div class="module-header glass-panel">
          <div class="header-content">
            <span class="hud-tag"><i class="fa-solid fa-calendar-days"></i> MISSION DATE & WINDOW PLANNER</span>
            <h2>Mission Date Planner</h2>
            <p>Identify optimal mission windows based on simultaneous solar illumination and Earth communication availability. Uses NASA/JPL Horizons ephemeris for real celestial geometry.</p>
          </div>
          <div class="planner-status-bar">
            <i class="fa-solid fa-satellite-dish"></i>
            <span id="planner-status-text">Initializing ephemeris engine...</span>
          </div>
        </div>

        <!-- Configuration Panel -->
        <div class="planner-config-grid">
          <!-- Date Range & Duration -->
          <div class="planner-config-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-calendar-range"></i> Mission Parameters</h4>
            </div>
            <div class="config-form">
              <div class="config-input-group">
                <label>Analysis Start Date (UTC):</label>
                <input type="date" id="plan-start-date" class="hud-date-input" value="${this.startDate}">
              </div>
              <div class="config-input-group">
                <label>Analysis End Date (UTC):</label>
                <input type="date" id="plan-end-date" class="hud-date-input" value="${this.endDate}">
              </div>
              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>Mission Duration:</span>
                  <strong id="plan-duration-val" class="cyan">${this.missionDurationDays} days</strong>
                </div>
                <input type="range" id="plan-duration-slider" min="1" max="90" step="1" value="${this.missionDurationDays}">
              </div>
              <div class="config-input-group">
                <div class="spec-label-row">
                  <span>Time Interval Resolution:</span>
                  <strong id="plan-step-val" class="silver">${this.stepHours}h steps</strong>
                </div>
                <select id="plan-step-select" class="hud-select-sm">
                  <option value="6" ${this.stepHours === 6 ? 'selected' : ''}>6-hour (High Resolution)</option>
                  <option value="12" ${this.stepHours === 12 ? 'selected' : ''}>12-hour (Standard)</option>
                  <option value="24" ${this.stepHours === 24 ? 'selected' : ''}>24-hour (Low Resolution)</option>
                </select>
              </div>
              <button id="plan-fetch-btn" class="btn-hud-primary">
                <i class="fa-solid fa-satellite"></i> Fetch Horizons Data & Compute Windows
              </button>
            </div>
          </div>

          <!-- Target Coordinates -->
          <div class="planner-config-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-crosshairs"></i> Target Coordinates</h4>
            </div>
            <div class="config-form">
              <div class="config-input-group">
                <label>Candidate Site:</label>
                <select id="plan-site-select" class="hud-select">
                  ${LUNAR_LANDING_SITES.map(s => `
                    <option value="${s.id}" ${s.id === site.id ? 'selected' : ''}>${s.name}</option>
                  `).join('')}
                  <option value="custom" ${this.useCustomCoords ? 'selected' : ''}>Custom Coordinates...</option>
                </select>
              </div>

              <div id="plan-custom-coords" style="display: ${this.useCustomCoords ? 'block' : 'none'}">
                <div class="config-input-group">
                  <label>Latitude (°S negative):</label>
                  <input type="number" id="plan-custom-lat" class="hud-number-input" value="${this.customLat}" min="-90" max="90" step="0.01">
                </div>
                <div class="config-input-group">
                  <label>Longitude (°E):</label>
                  <input type="number" id="plan-custom-lon" class="hud-number-input" value="${this.customLon}" min="-180" max="180" step="0.01">
                </div>
                <div class="config-input-group">
                  <label>Elevation (km above datum):</label>
                  <input type="number" id="plan-custom-elev" class="hud-number-input" value="${this.customElevKm}" min="-9" max="10" step="0.01">
                </div>
              </div>

              <div class="coord-readout-box">
                <div class="coord-row">
                  <span>Active Latitude:</span>
                  <strong class="cyan" id="plan-active-lat">${this.activeLat.toFixed(2)}° S</strong>
                </div>
                <div class="coord-row">
                  <span>Active Longitude:</span>
                  <strong class="cyan" id="plan-active-lon">${this.activeLon.toFixed(2)}° E</strong>
                </div>
                <div class="coord-row">
                  <span>Active Elevation:</span>
                  <strong class="gold" id="plan-active-elev">+${(this.activeElevKm * 1000).toFixed(0)} m</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mission Timeline Chart -->
        <div class="planner-chart-card glass-panel">
          <div class="chart-header">
            <h4><i class="fa-solid fa-chart-gantt"></i> Mission Opportunity Timeline</h4>
            <span class="chart-subtitle">Combined illumination & Earth visibility windows</span>
          </div>
          <div class="chart-wrapper" style="height: 280px;">
            <canvas id="planner-timeline-chart"></canvas>
          </div>
        </div>

        <!-- Optimal Windows Results -->
        <div id="planner-windows-results" class="planner-windows-container">
          <div class="planner-loading-state glass-panel">
            <i class="fa-solid fa-satellite-dish fa-spin"></i>
            <p>Computing mission windows from ephemeris data...</p>
          </div>
        </div>

        <!-- Analysis Summary -->
        <div id="planner-analysis-summary" class="planner-analysis-grid" style="display:none;">
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderResults() {
    const container = document.getElementById('planner-windows-results');
    const summary = document.getElementById('planner-analysis-summary');
    if (!container) return;

    const optimalWindows = this.findOptimalWindows();
    const totalPoints = this.windows.length;
    const litCount = this.windows.filter(w => w.isSunlit).length;
    const earthVisCount = this.windows.filter(w => w.isEarthVisible).length;
    const bothCount = this.windows.filter(w => w.isSunlit && w.isEarthVisible).length;

    // Render optimal windows list
    if (optimalWindows.length === 0) {
      container.innerHTML = `
        <div class="planner-no-windows glass-panel">
          <i class="fa-solid fa-triangle-exclamation hazard-text"></i>
          <p>No favorable windows found in the selected date range where both solar illumination and Earth LOS are simultaneously available. 
          Consider extending the analysis period or choosing a site with higher illumination and Earth visibility.</p>
        </div>
      `;
    } else {
      const rankColors = ['#D29922', '#36D6D0', '#65D9B0', '#A371F7', '#78939B'];
      container.innerHTML = `
        <div class="windows-results-header glass-panel">
          <span class="hud-tag"><i class="fa-solid fa-trophy"></i> OPTIMAL LANDING WINDOWS (Ranked by Suitability)</span>
          <p>Windows where solar power AND Earth communications are simultaneously favorable for mission operations.</p>
        </div>
        <div class="windows-cards-grid">
          ${optimalWindows.map((w, idx) => `
            <div class="window-card glass-panel ${idx === 0 ? 'glow-gold' : ''}">
              <div class="window-rank-badge" style="background: ${rankColors[idx]}22; border-color: ${rankColors[idx]};">
                <span style="color: ${rankColors[idx]}">#${idx + 1}</span>
              </div>
              <div class="window-card-body">
                <div class="window-title">Landing Window ${idx + 1}${idx === 0 ? ' — RECOMMENDED' : ''}</div>
                <div class="window-dates">
                  <i class="fa-solid fa-calendar-check"></i>
                  ${w.start} → ${w.end}
                </div>
                <div class="window-metrics-row">
                  <div class="window-metric">
                    <span>Duration:</span>
                    <strong class="gold">${w.durationHours}h (${Math.round(w.durationHours / 24)} days)</strong>
                  </div>
                  <div class="window-metric">
                    <span>Suitability Score:</span>
                    <strong style="color: ${rankColors[idx]}">${w.avgScore}/100</strong>
                  </div>
                  <div class="window-metric">
                    <span>Peak Sun Elevation:</span>
                    <strong class="gold">${w.maxSunEl.toFixed(1)}°</strong>
                  </div>
                  <div class="window-metric">
                    <span>Peak Earth Elevation:</span>
                    <strong class="cyan">${w.maxEarthEl.toFixed(1)}°</strong>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Render analysis summary
    if (summary && totalPoints > 0) {
      summary.style.display = 'grid';
      summary.innerHTML = `
        <div class="analysis-summary-card glass-panel">
          <div class="card-header-styled">
            <h4><i class="fa-solid fa-chart-pie"></i> Period Analysis Summary</h4>
          </div>
          <div class="summary-stats">
            <div class="summary-stat-row">
              <span>Total Points Analyzed:</span>
              <strong class="silver">${totalPoints} intervals (${this.stepHours}h each)</strong>
            </div>
            <div class="summary-stat-row">
              <span>Solar Illumination Time:</span>
              <strong class="gold">${Math.round(litCount / totalPoints * 100)}% of period (${litCount * this.stepHours}h)</strong>
            </div>
            <div class="summary-stat-row">
              <span>Earth Visibility Time:</span>
              <strong class="cyan">${Math.round(earthVisCount / totalPoints * 100)}% of period (${earthVisCount * this.stepHours}h)</strong>
            </div>
            <div class="summary-stat-row">
              <span>Both Favorable Simultaneously:</span>
              <strong class="green">${Math.round(bothCount / totalPoints * 100)}% of period (${bothCount * this.stepHours}h)</strong>
            </div>
            <div class="summary-stat-row">
              <span>Optimal Windows Found:</span>
              <strong class="${optimalWindows.length > 0 ? 'green' : 'hazard-text'}">${optimalWindows.length} window${optimalWindows.length !== 1 ? 's' : ''}</strong>
            </div>
          </div>
        </div>

        <div class="analysis-summary-card glass-panel">
          <div class="card-header-styled">
            <h4><i class="fa-solid fa-lightbulb"></i> Mission Planning Notes</h4>
          </div>
          <div class="planning-notes">
            <div class="planning-note">
              <i class="fa-solid fa-sun gold"></i>
              <span>Solar illumination at the lunar South Pole is driven by the Moon's 1.543° obliquity. 
              Polar sites experience extended multi-day sunlit periods with grazing sun angles (&lt;7°).</span>
            </div>
            <div class="planning-note">
              <i class="fa-solid fa-earth-americas cyan"></i>
              <span>Earth visibility oscillates over the 27.21-day draconic libration cycle (±6.68° latitude wobble). 
              High-elevation sites gain additional horizon dip angles that extend communication windows.</span>
            </div>
            <div class="planning-note">
              <i class="fa-solid fa-calendar-check green"></i>
              <span>Optimal landing windows require both conditions simultaneously. 
              For the ${this.currentSite ? this.currentSite.name : 'selected'} site, targeting early libration phases maximizes Earth elevation clearance.</span>
            </div>
            <div class="planning-note">
              <i class="fa-solid fa-database silver"></i>
              <span>Data source: ${this.sunData ? this.sunData.source : 'Analytical engine'} | 
              Assumptions: flat local horizon, no terrain obstruction. Actual mission planning requires SPICE kernel analysis.</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  renderChart() {
    if (!window.Chart) return;
    const canvas = document.getElementById('planner-timeline-chart');
    if (!canvas) return;

    if (this._chart) { this._chart.destroy(); this._chart = null; }
    if (this.windows.length === 0) return;

    const labels = this.windows.map(w => w.time);
    const sunEls = this.windows.map(w => w.sunEl);
    const earthEls = this.windows.map(w => w.earthEl);
    const scores = this.windows.map(w => w.score);

    this._chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Sun Elevation (°)',
            data: sunEls,
            borderColor: '#D29922',
            backgroundColor: 'rgba(210, 153, 34, 0.1)',
            fill: false,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0,
            yAxisID: 'yEl'
          },
          {
            label: 'Earth Elevation (°)',
            data: earthEls,
            borderColor: '#36D6D0',
            backgroundColor: 'rgba(54, 214, 208, 0.1)',
            fill: false,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0,
            yAxisID: 'yEl'
          },
          {
            label: 'Combined Suitability Score',
            data: scores,
            borderColor: '#65D9B0',
            backgroundColor: 'rgba(101, 217, 176, 0.15)',
            fill: true,
            tension: 0.3,
            borderWidth: 1.5,
            pointRadius: 0,
            yAxisID: 'yScore'
          },
          {
            label: 'Horizon (0°)',
            data: this.windows.map(() => 0),
            borderColor: 'rgba(248, 81, 73, 0.7)',
            borderDash: [4, 3],
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
            yAxisID: 'yEl'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yEl: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Elevation Angle (°)', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.7)' },
            ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono' } }
          },
          yScore: {
            type: 'linear',
            position: 'right',
            min: 0, max: 100,
            title: { display: true, text: 'Suitability Score', color: '#65D9B0' },
            grid: { drawOnChartArea: false },
            ticks: { color: '#65D9B0', font: { family: 'IBM Plex Mono' } }
          },
          x: {
            title: { display: true, text: 'UTC Date/Time', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.6)' },
            ticks: { color: '#94a3b8', maxTicksLimit: 12, font: { family: 'IBM Plex Mono', size: 10 } }
          }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#e2e8f0', font: { family: 'Inter' } } },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.datasetIndex <= 1) return `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}°`;
                return `${ctx.dataset.label}: ${ctx.raw}/100`;
              }
            }
          }
        }
      }
    });
  }

  bindEvents() {
    const fetchBtn = document.getElementById('plan-fetch-btn');
    if (fetchBtn) {
      fetchBtn.addEventListener('click', () => {
        audioSystem.playClick();
        const startEl = document.getElementById('plan-start-date');
        const endEl = document.getElementById('plan-end-date');
        const stepSel = document.getElementById('plan-step-select');
        if (startEl) this.startDate = startEl.value;
        if (endEl) this.endDate = endEl.value;
        if (stepSel) this.stepHours = parseInt(stepSel.value);
        this.sunData = null;
        this.earthData = null;
        this.windows = [];
        this.renderResults();
        this.fetchData();
      });
    }

    const durationSlider = document.getElementById('plan-duration-slider');
    if (durationSlider) {
      durationSlider.addEventListener('input', e => {
        this.missionDurationDays = parseInt(e.target.value);
        const valEl = document.getElementById('plan-duration-val');
        if (valEl) valEl.textContent = `${this.missionDurationDays} days`;
      });
    }

    const siteSelect = document.getElementById('plan-site-select');
    if (siteSelect) {
      siteSelect.addEventListener('change', e => {
        const val = e.target.value;
        const customPanel = document.getElementById('plan-custom-coords');
        if (val === 'custom') {
          this.useCustomCoords = true;
          if (customPanel) customPanel.style.display = 'block';
        } else {
          this.useCustomCoords = false;
          if (customPanel) customPanel.style.display = 'none';
          const s = LUNAR_LANDING_SITES.find(x => x.id === val);
          if (s) {
            audioSystem.playClick();
            this.currentSite = s;
            this.customLat = s.latitude;
            this.customLon = s.longitude;
            this.customElevKm = (s.elevation || 0) / 1000;
            this.updateCoordDisplay();
          }
        }
      });
    }

    ['plan-custom-lat', 'plan-custom-lon', 'plan-custom-elev'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          const latEl = document.getElementById('plan-custom-lat');
          const lonEl = document.getElementById('plan-custom-lon');
          const elevEl = document.getElementById('plan-custom-elev');
          if (latEl) this.customLat = parseFloat(latEl.value);
          if (lonEl) this.customLon = parseFloat(lonEl.value);
          if (elevEl) this.customElevKm = parseFloat(elevEl.value);
          this.updateCoordDisplay();
        });
      }
    });
  }

  updateCoordDisplay() {
    const latEl = document.getElementById('plan-active-lat');
    const lonEl = document.getElementById('plan-active-lon');
    const elevEl = document.getElementById('plan-active-elev');
    if (latEl) latEl.textContent = `${this.activeLat.toFixed(2)}° S`;
    if (lonEl) lonEl.textContent = `${this.activeLon.toFixed(2)}° E`;
    if (elevEl) elevEl.textContent = `+${(this.activeElevKm * 1000).toFixed(0)} m`;
  }
}
