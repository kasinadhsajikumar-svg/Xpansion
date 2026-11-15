/**
 * LUNAR NAV — Earth Communication Analysis Module
 * Validates Direct-To-Earth (DTE) Line of Sight taking into account lunar libration oscillations (±6.7° lat),
 * terrain horizon dip gains, RF link budget margins, signal latency, and lunar relay needs.
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import {
  calculateEarthElevation,
  generateEarthLibrationProfile
} from '../data/ephemerisData.js';
import { audioSystem } from './audioEffects.js';

export class EarthCommAnalysisModule {
  constructor(containerId, initialSiteId = 'site-002') {
    this.container = document.getElementById(containerId);
    this.currentSite = LUNAR_LANDING_SITES.find(s => s.id === initialSiteId) || LUNAR_LANDING_SITES[0];
    this.chart = null;
    this.currentDay = 6.8; // current day in 27.21-day libration cycle
    this.frequencyBand = 'Ka'; // 'S', 'X', 'Ka'
    this.groundStation = 'All'; // DSN Goldstone, Madrid, Canberra

    this.render();
  }

  setSite(site) {
    this.currentSite = site;
    this.render();
  }

  render() {
    if (!this.container) return;

    const site = this.currentSite;
    const earthStatus = calculateEarthElevation(site.latitude, site.longitude, this.currentDay, site.elevation);
    const libProfile = generateEarthLibrationProfile(site);

    this.container.innerHTML = `
      <div class="comm-module-container">
        <!-- Module Header -->
        <div class="module-header glass-panel">
          <div class="header-content">
            <span class="hud-tag"><i class="fa-solid fa-satellite-dish"></i> DIRECT-TO-EARTH (DTE) TELEMETRY</span>
            <h2>Earth Communication Analysis: ${site.name}</h2>
            <p>Evaluation of Earth line-of-sight elevation over the 27.21-day lunar libration cycle, occultation risks, and Deep Space Network (DSN) link budgets.</p>
          </div>
          <div class="site-dropdown-wrap">
            <label>Active Target:</label>
            <select id="comm-site-select" class="hud-select">
              ${LUNAR_LANDING_SITES.map(s => `
                <option value="${s.id}" ${s.id === site.id ? 'selected' : ''}>${s.name} (${s.earthVisibility}% DTE LOS)</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="comm-metrics-grid">
          <div class="metric-hud-card glass-panel glow-cyan">
            <div class="card-top">
              <span class="hud-mini-label">DTE LINE-OF-SIGHT TIME</span>
              <i class="fa-solid fa-earth-americas icon-cyan"></i>
            </div>
            <div class="hud-stat-value cyan">${site.earthVisibility}%</div>
            <div class="hud-stat-desc">Of the 27.21-day libration month</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">MAXIMUM BLACKOUT WINDOW</span>
              <i class="fa-solid fa-tower-broadcast icon-hazard"></i>
            </div>
            <div class="hud-stat-value ${libProfile.occultationHours > 80 ? 'hazard-text' : (libProfile.occultationHours > 0 ? 'caution-text' : 'safe-text')}">
              ${libProfile.occultationHours} Earth Hours
            </div>
            <div class="hud-stat-desc">${libProfile.occultationHours === 0 ? 'Continuous permanent Earth line-of-sight' : 'Requires orbital relay satellite'}</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">ONE-WAY RF SIGNAL DELAY</span>
              <i class="fa-solid fa-stopwatch icon-gold"></i>
            </div>
            <div class="hud-stat-value gold">1.282 sec</div>
            <div class="hud-stat-desc">Light-travel time (384,400 km)</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">RF LINK RELIABILITY LEVEL</span>
              <i class="fa-solid fa-signal icon-cyan"></i>
            </div>
            <div class="hud-stat-value ${site.earthVisibility >= 85 ? 'green' : 'gold'}">
              ${site.earthVisibility >= 85 ? 'TIER 1 (PRIME BASECAMP)' : 'TIER 2 (PERIODIC RELAY)'}
            </div>
            <div class="hud-stat-desc">DSN 34m Beam Clearance</div>
          </div>
        </div>

        <!-- Libration Timeline Scrubber -->
        <div class="timeline-scrubber-card glass-panel">
          <div class="scrubber-header">
            <h4><i class="fa-solid fa-compass"></i> Lunar Libration Cycle Scrubber (27.21 Days / Draconic Month)</h4>
            <span class="current-epoch-badge">
              Day <strong id="lib-day-val" class="cyan">${this.currentDay}</strong> / 27.2 d
              (Sub-Earth Lat: <span id="sub-earth-lat-val">${earthStatus.subEarthLat}°</span>)
            </span>
          </div>

          <div class="scrubber-controls">
            <input type="range" id="lib-day-slider" min="0" max="27.2" step="0.2" value="${this.currentDay}">
            <div class="scrubber-markers">
              <span>Day 0 (Equatorial Node)</span>
              <span>Day 6.8 (Max +6.7° North Libration)</span>
              <span>Day 13.6 (Nodal Crossing)</span>
              <span>Day 20.4 (Max -6.7° South Libration)</span>
              <span>Day 27.2 (Cycle Reset)</span>
            </div>
          </div>

          <div class="telemetry-readout-strip">
            <div class="readout-item">
              <span class="lbl">Apparent Earth Elevation:</span>
              <span id="instant-earth-el" class="val ${earthStatus.isVisible ? 'cyan' : 'hazard-text'}">
                ${earthStatus.earthElevationDeg > 0 ? `+${earthStatus.earthElevationDeg}°` : `${earthStatus.earthElevationDeg}°`}
              </span>
            </div>
            <div class="readout-item">
              <span class="lbl">RF Link Status:</span>
              <span id="instant-earth-status" class="val ${earthStatus.rfLinkMargin ? 'status-lit' : (earthStatus.isVisible ? 'gold' : 'status-shadow')}">
                ${earthStatus.dteLinkStatus}
              </span>
            </div>
            <div class="readout-item">
              <span class="lbl">Topographic Horizon Dip Bonus:</span>
              <span class="val green">+${earthStatus.horizonDipGainDeg}° from LOLA Altitude</span>
            </div>
          </div>
        </div>

        <!-- Earth Elevation Chart -->
        <div class="comm-chart-card glass-panel">
          <div class="chart-header">
            <h4><i class="fa-solid fa-chart-area"></i> Earth Elevation Angle vs Time (Libration Sine Oscillation)</h4>
            <span class="chart-subtitle">Clear distinction: Above 0.8° = High-Margin RF Link | 0° to 0.8° = Multipath Hazard | Below 0° = Occultation</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="earth-elevation-chart"></canvas>
          </div>
        </div>

        <!-- Scientific Distinction: Geometric Visibility vs RF Link Budget -->
        <div class="comm-details-grid">
          <!-- RF Link Budget & DSN Card -->
          <div class="comm-tech-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-tower-cell"></i> RF Link Budget & Frequency Bands</h4>
            </div>
            <div class="comm-tech-body">
              <p>Direct line-of-sight geometry alone does not guarantee error-free radio links. When Earth hangs lower than 0.8° above the horizon, radio waves suffer <em>multipath reflections</em> off nearby undulating crater ridges and regolith diffraction.</p>
              
              <div class="freq-band-selector">
                <span class="f-lbl">Select Link Protocol:</span>
                <div class="freq-btns">
                  <button class="btn-freq-pill ${this.frequencyBand === 'S' ? 'active' : ''}" data-band="S">S-Band (TT&C Telemetry)</button>
                  <button class="btn-freq-pill ${this.frequencyBand === 'X' ? 'active' : ''}" data-band="X">X-Band (Payload Data)</button>
                  <button class="btn-freq-pill ${this.frequencyBand === 'Ka' ? 'active' : ''}" data-band="Ka">Ka-Band (HD Video / Science)</button>
                </div>
              </div>

              <div id="freq-spec-box" class="freq-spec-box">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>

          <!-- Lunar Relay Satellite Architecture Card -->
          <div class="comm-tech-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-satellite"></i> Lunar Orbital Relay Architecture</h4>
            </div>
            <div class="comm-tech-body">
              <p>For landing sites located in crater bowls (e.g. Cabeus) or during negative southern libration dips when Earth sinks below the local horizon, an active relay satellite is mandatory for mission continuity.</p>
              
              <div class="relay-architecture-list">
                <div class="relay-item">
                  <i class="fa-solid fa-circle-nodes cyan"></i>
                  <div>
                    <strong>Gateway NRHO Orbit:</strong>
                    <span>Near-Rectilinear Halo Orbit (9:2 resonance, 7-day period) maintains uninterrupted line-of-sight to the lunar South Pole during its 12-hour polar pericenter passage.</span>
                  </div>
                </div>
                <div class="relay-item">
                  <i class="fa-solid fa-network-wired gold"></i>
                  <div>
                    <strong>CLPS Lunar Communications Constellation:</strong>
                    <span>A three-satellite halo constellation at Earth-Moon L2 ensures 100% full-duplex high-bandwidth coverage regardless of polar libration.</span>
                  </div>
                </div>
                <div class="relay-item">
                  <i class="fa-solid fa-shield green"></i>
                  <div>
                    <strong>Local Surface UHF/Wi-Fi Repeaters:</strong>
                    <span>High-elevation towers on Malapert Mountain can relay signals to rovers operating down inside the pitch-black floor of Haworth or Shackleton.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateFreqSpec();
    this.renderChart(libProfile);
  }

  bindEvents() {
    const siteSelect = document.getElementById('comm-site-select');
    if (siteSelect) {
      siteSelect.addEventListener('change', (e) => {
        const siteId = e.target.value;
        const s = LUNAR_LANDING_SITES.find(item => item.id === siteId);
        if (s) {
          audioSystem.playClick();
          this.currentSite = s;
          this.render();
        }
      });
    }

    const slider = document.getElementById('lib-day-slider');
    const dayVal = document.getElementById('lib-day-val');
    const instantEl = document.getElementById('instant-earth-el');
    const instantStatus = document.getElementById('instant-earth-status');
    const subLatVal = document.getElementById('sub-earth-lat-val');

    if (slider) {
      slider.addEventListener('input', (e) => {
        this.currentDay = parseFloat(e.target.value);
        if (dayVal) dayVal.textContent = this.currentDay;

        const res = calculateEarthElevation(this.currentSite.latitude, this.currentSite.longitude, this.currentDay, this.currentSite.elevation);
        if (subLatVal) subLatVal.textContent = `${res.subEarthLat}°`;

        if (instantEl) {
          instantEl.textContent = res.earthElevationDeg > 0 ? `+${res.earthElevationDeg}°` : `${res.earthElevationDeg}°`;
          instantEl.className = `val ${res.isVisible ? 'cyan' : 'hazard-text'}`;
        }
        if (instantStatus) {
          instantStatus.textContent = res.dteLinkStatus;
          instantStatus.className = `val ${res.rfLinkMargin ? 'status-lit' : (res.isVisible ? 'gold' : 'status-shadow')}`;
        }
      });
    }

    // Freq pill buttons
    const freqBtns = this.container.querySelectorAll('.btn-freq-pill');
    freqBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        audioSystem.playClick();
        freqBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.frequencyBand = btn.getAttribute('data-band');
        this.updateFreqSpec();
      });
    });
  }

  updateFreqSpec() {
    const box = document.getElementById('freq-spec-box');
    if (!box) return;

    const specs = {
      S: {
        freq: '2.025 – 2.110 GHz (Uplink) / 2.200 – 2.290 GHz (Downlink)',
        dataRate: '256 kbps – 2 Mbps',
        antenna: '0.3m Low-Gain Omni or Medium-Gain Horn',
        minElevation: '0.4° above horizon',
        notes: 'Primary telemetry, tracking, and command (TT&C) carrier. Highly resilient to multipath terrain grazing.'
      },
      X: {
        freq: '7.145 – 7.190 GHz (Uplink) / 8.400 – 8.450 GHz (Downlink)',
        dataRate: '10 Mbps – 50 Mbps',
        antenna: '0.6m Steerable Parabolic High-Gain Antenna (HGA)',
        minElevation: '0.8° above horizon',
        notes: 'Standard NASA science downlink frequency. Excellent balance of data throughput and antenna pointing margin.'
      },
      Ka: {
        freq: '34.2 – 34.7 GHz (Uplink) / 31.8 – 32.3 GHz (Downlink)',
        dataRate: '100 Mbps – 450 Mbps (Gigabit Optical Laser Hybrid)',
        antenna: '0.8m Phased Array or High-Precision Reflector',
        minElevation: '1.2° above horizon',
        notes: 'Ultra-high throughput for live 4K astronaut video and 3D hyperspectral LIDAR maps. Demands tight pointing within ±0.05°.'
      }
    };

    const s = specs[this.frequencyBand];
    box.innerHTML = `
      <div class="spec-row"><span>Carrier Band:</span> <strong>${this.frequencyBand}-Band (${s.freq})</strong></div>
      <div class="spec-row"><span>Achievable Throughput:</span> <strong class="cyan">${s.dataRate}</strong></div>
      <div class="spec-row"><span>Required Lander Antenna:</span> <strong>${s.antenna}</strong></div>
      <div class="spec-row"><span>Horizon Clearance Required:</span> <strong class="gold">${s.minElevation}</strong></div>
      <div class="spec-desc">${s.notes}</div>
    `;
  }

  renderChart(libProfile) {
    if (!window.Chart) return;
    const canvas = document.getElementById('earth-elevation-chart');
    if (!canvas) return;

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: libProfile.days,
        datasets: [
          {
            label: 'Earth Apparent Elevation Angle (°)',
            data: libProfile.earthElevations,
            borderColor: '#36D6D0',
            backgroundColor: 'rgba(54, 214, 208, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'RF Multipath Margin Threshold (+0.8°)',
            data: libProfile.days.map(() => 0.8),
            borderColor: '#D29922',
            borderDash: [5, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Horizon Occultation Line (0.0°)',
            data: libProfile.days.map(() => 0),
            borderColor: '#F85149',
            borderDash: [2, 2],
            borderWidth: 2,
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
            title: { display: true, text: 'Elevation Above Local Horizon (°)', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.7)' },
            ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono' } }
          },
          x: {
            title: { display: true, text: 'Day in 27.21-Day Libration Month', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.6)' },
            ticks: { color: '#94a3b8', maxTicksLimit: 14, font: { family: 'IBM Plex Mono' } }
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
