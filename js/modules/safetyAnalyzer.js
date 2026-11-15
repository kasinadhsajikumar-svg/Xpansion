/**
 * LUNAR NAV — Landing Safety Analyzer Module
 * Rigorous aerospace engineering safety assessment evaluating:
 * terrain slope, surface roughness (Hurst exponent), boulder strike probability,
 * lander footprint stability, and dynamic touchdown tip-over margins.
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import { audioSystem } from './audioEffects.js';

export class LandingSafetyAnalyzerModule {
  constructor(containerId, initialSiteId = 'site-002') {
    this.container = document.getElementById(containerId);
    this.currentSite = LUNAR_LANDING_SITES.find(s => s.id === initialSiteId) || LUNAR_LANDING_SITES[0];

    // Spacecraft Lander Specifications
    this.landerSpecs = {
      dryMassKg: 1850,
      footprintDiameterM: 4.8,
      gearStrokeM: 0.40,
      maxTipOverAngleDeg: 12.0,
      touchdownVelocityMps: 1.5,
      navigationAccuracyM: 150 // Terrain Relative Navigation (TRN) ellipse radius
    };

    this.chart = null;
    this.render();
  }

  setSite(site) {
    this.currentSite = site;
    this.render();
  }

  /**
   * Computes comprehensive engineering safety metrics
   */
  computeSafetyAssessment() {
    const s = this.currentSite;
    const l = this.landerSpecs;

    // 1. Slope Safety Margin
    // Slope margin = (Lander max slope tolerance - site slope) / tolerance
    const slopeMarginDeg = l.maxTipOverAngleDeg - s.slope;
    const slopeSafetyPct = Math.max(0, Math.min(100, Math.round((slopeMarginDeg / l.maxTipOverAngleDeg) * 100)));

    // 2. Tip-over Risk Estimation
    // Based on center-of-mass height, footprint radius, and terrain slope:
    // tan(critical) = (footprint / 2) / (cg_height)
    const effectiveCgHeight = l.footprintDiameterM * 0.75;
    const staticStabilityAngle = (Math.atan((l.footprintDiameterM / 2) / effectiveCgHeight) * 180) / Math.PI;
    const dynamicTipOverRisk = Math.max(0.5, Math.min(45, (s.slope / staticStabilityAngle) * 22 * (l.touchdownVelocityMps / 1.5)));

    // 3. Boulder Strike Probability
    // Poisson distribution for finding >= 1 boulder of height > gear stroke in landing ellipse
    // Lambda = density * area
    const landingAreaM2 = Math.PI * Math.pow(l.navigationAccuracyM, 2);
    const boulderDensityM2 = s.surfaceHazards.riskScore * 0.00025;
    const expectedBoulders = boulderDensityM2 * landingAreaM2;
    const boulderHazardPct = Math.min(95, Math.round((1 - Math.exp(-expectedBoulders * 0.04)) * 100));

    // 4. Roughness / Micro-crater Hazard
    const roughnessHazardPct = Math.round((1 - s.surfaceHazards.roughnessHurst) * 200);

    // 5. Composite Safety Score (0 to 100)
    // Higher is safer
    let compositeScore = Math.round(
      slopeSafetyPct * 0.45 +
      (100 - boulderHazardPct) * 0.25 +
      (100 - roughnessHazardPct) * 0.15 +
      s.slopeDistribution.flat * 0.15
    );
    compositeScore = Math.max(10, Math.min(99, compositeScore));

    let verdict = "GO — NOMINAL LANDING PROFILE";
    let verdictColor = "green";
    if (compositeScore < 70) {
      verdict = "NO-GO — EXCEEDS HAZARD TOLERANCE";
      verdictColor = "hazard";
    } else if (compositeScore < 85) {
      verdict = "CAUTION — REQUIRES ACTIVE HDA RELOCATION";
      verdictColor = "gold";
    }

    return {
      slopeMarginDeg: Number(slopeMarginDeg.toFixed(1)),
      slopeSafetyPct,
      staticStabilityAngle: Number(staticStabilityAngle.toFixed(1)),
      dynamicTipOverRisk: Number(dynamicTipOverRisk.toFixed(1)),
      boulderHazardPct,
      roughnessHazardPct,
      compositeScore,
      verdict,
      verdictColor
    };
  }

  render() {
    if (!this.container) return;

    const site = this.currentSite;
    const assess = this.computeSafetyAssessment();

    this.container.innerHTML = `
      <div class="safety-module-container">
        <!-- Module Header -->
        <div class="module-header glass-panel">
          <div class="header-content">
            <span class="hud-tag"><i class="fa-solid fa-shield-halved"></i> AEROSPACE SAFETY & HAZARD MATRIX</span>
            <h2>Landing Safety Analyzer: ${site.name}</h2>
            <p>Evaluating touchdown dynamics, slope tip-over margins, surface roughness, and Hazard Detection and Avoidance (HDA) telemetry.</p>
          </div>
          <div class="site-dropdown-wrap">
            <label>Active Target:</label>
            <select id="safety-site-select" class="hud-select">
              ${LUNAR_LANDING_SITES.map(s => `
                <option value="${s.id}" ${s.id === site.id ? 'selected' : ''}>${s.name} (Slope: ${s.slope}°)</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Safety Verdict Banner -->
        <div class="safety-verdict-banner glass-panel glow-${assess.verdictColor}">
          <div class="verdict-left">
            <span class="hud-mini-label">MISSION CONTROL TOUCHDOWN VERDICT</span>
            <h3 class="verdict-title ${assess.verdictColor}">${assess.verdict}</h3>
            <span class="verdict-rationale">
              Based on ${site.slope}° average terrain slope, ${this.landerSpecs.footprintDiameterM}m lander footprint, and ${this.landerSpecs.navigationAccuracyM}m TRN landing ellipse.
            </span>
          </div>
          <div class="verdict-score-box">
            <span class="score-title">SAFETY INDEX</span>
            <span class="score-big ${assess.verdictColor}">${assess.compositeScore}</span>
            <span class="score-denom">/ 100</span>
          </div>
        </div>

        <!-- 4-Card Telemetry Grid -->
        <div class="safety-metrics-grid">
          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">SLOPE CLEARANCE MARGIN</span>
              <i class="fa-solid fa-arrows-split-up-and-left icon-cyan"></i>
            </div>
            <div class="hud-stat-value cyan">+${assess.slopeMarginDeg}°</div>
            <div class="hud-stat-desc">Target: ${site.slope}° vs Max: ${this.landerSpecs.maxTipOverAngleDeg}°</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">DYNAMIC TIP-OVER RISK</span>
              <i class="fa-solid fa-triangle-exclamation ${assess.dynamicTipOverRisk < 5 ? 'icon-green' : 'icon-hazard'}"></i>
            </div>
            <div class="hud-stat-value ${assess.dynamicTipOverRisk < 5 ? 'green' : 'hazard-text'}">${assess.dynamicTipOverRisk}%</div>
            <div class="hud-stat-desc">Touchdown at ${this.landerSpecs.touchdownVelocityMps} m/s vector</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">BOULDER STRIKE RISK</span>
              <i class="fa-solid fa-cubes-stacked icon-gold"></i>
            </div>
            <div class="hud-stat-value gold">${assess.boulderHazardPct}%</div>
            <div class="hud-stat-desc">Obstacles &gt; ${this.landerSpecs.gearStrokeM}m clearance</div>
          </div>

          <div class="metric-hud-card glass-panel">
            <div class="card-top">
              <span class="hud-mini-label">FLAT TERRAIN PROBABILITY</span>
              <i class="fa-solid fa-layer-group icon-cyan"></i>
            </div>
            <div class="hud-stat-value cyan">${site.slopeDistribution.flat}%</div>
            <div class="hud-stat-desc">Local area with slope &lt; 5°</div>
          </div>
        </div>

        <!-- Interactive Lander Specs & Hazards Breakdown -->
        <div class="safety-detail-grid">
          <!-- Configurable Spacecraft Parameters -->
          <div class="lander-specs-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-space-shuttle"></i> Spacecraft Lander Configuration</h4>
              <span class="sub-text">Modify lander geometry to observe real-time safety margins</span>
            </div>

            <div class="specs-form">
              <div class="spec-input-group">
                <div class="spec-label-row">
                  <span>Footprint Stance Diameter:</span>
                  <strong id="spec-footprint-val" class="cyan">${this.landerSpecs.footprintDiameterM} m</strong>
                </div>
                <input type="range" id="spec-footprint-slider" min="2.5" max="8.0" step="0.2" value="${this.landerSpecs.footprintDiameterM}">
              </div>

              <div class="spec-input-group">
                <div class="spec-label-row">
                  <span>Max Tip-Over Angle Tolerance:</span>
                  <strong id="spec-tipangle-val" class="gold">${this.landerSpecs.maxTipOverAngleDeg}°</strong>
                </div>
                <input type="range" id="spec-tipangle-slider" min="8" max="20" step="0.5" value="${this.landerSpecs.maxTipOverAngleDeg}">
              </div>

              <div class="spec-input-group">
                <div class="spec-label-row">
                  <span>Touchdown Descent Velocity:</span>
                  <strong id="spec-velocity-val" class="silver">${this.landerSpecs.touchdownVelocityMps} m/s</strong>
                </div>
                <input type="range" id="spec-velocity-slider" min="0.5" max="3.5" step="0.1" value="${this.landerSpecs.touchdownVelocityMps}">
              </div>

              <div class="spec-input-group">
                <div class="spec-label-row">
                  <span>Landing Navigation Radius (TRN):</span>
                  <strong id="spec-accuracy-val" class="cyan">${this.landerSpecs.navigationAccuracyM} m</strong>
                </div>
                <input type="range" id="spec-accuracy-slider" min="50" max="1000" step="25" value="${this.landerSpecs.navigationAccuracyM}">
              </div>
            </div>
          </div>

          <!-- Hazard Breakdown & Recommendations -->
          <div class="hazard-factors-card glass-panel">
            <div class="card-header-styled">
              <h4><i class="fa-solid fa-list-check"></i> Contributing Hazard Factors & Mitigations</h4>
            </div>

            <div class="factors-list">
              <div class="factor-item">
                <div class="factor-header">
                  <span>Terrain Slope Profile (${site.slope}° average)</span>
                  <span class="factor-status ${site.slope < 6 ? 'safe' : 'caution'}">${site.slope < 6 ? 'BENIGN' : 'MODERATE RISK'}</span>
                </div>
                <div class="factor-bar-track">
                  <div class="factor-bar-fill ${site.slope < 6 ? 'green' : 'gold'}" style="width: ${Math.min(100, (site.slope / 15) * 100)}%"></div>
                </div>
                <p>Flat slope comprises ${site.slopeDistribution.flat}% of the immediate landing zone. Avoid inner crater boundary walls.</p>
              </div>

              <div class="factor-item">
                <div class="factor-header">
                  <span>Surface Boulder & Regolith Blockiness</span>
                  <span class="factor-status ${assess.boulderHazardPct < 30 ? 'safe' : 'hazard'}">${site.surfaceHazards.hazardLevel}</span>
                </div>
                <div class="factor-bar-track">
                  <div class="factor-bar-fill ${assess.boulderHazardPct < 30 ? 'green' : 'red'}" style="width: ${assess.boulderHazardPct}%"></div>
                </div>
                <p>Diviner rock abundance: ${site.surfaceHazards.boulderAbundance}. Active Hazard Detection and Avoidance (HDA) LIDAR required during terminal 100m descent.</p>
              </div>

              <div class="factor-item">
                <div class="factor-header">
                  <span>Sub-meter Surface Roughness (Hurst Exponent: ${site.surfaceHazards.roughnessHurst})</span>
                  <span class="factor-status safe">NORMAL COMPACTED REGOLITH</span>
                </div>
                <div class="factor-bar-track">
                  <div class="factor-bar-fill cyan" style="width: ${Math.round(site.surfaceHazards.roughnessHurst * 100)}%"></div>
                </div>
                <p>High Hurst value (${site.surfaceHazards.roughnessHurst}) denotes self-affine smoothed regolith with low small-scale fracturing.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Slope Distribution Doughnut / Bar Chart -->
        <div class="safety-chart-card glass-panel">
          <div class="chart-header">
            <h4><i class="fa-solid fa-chart-pie"></i> Landing Zone Micro-Topography Slope Distribution</h4>
            <span class="chart-subtitle">LOLA 5-meter/pixel Elevation Model Breakdown</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="slope-distribution-chart"></canvas>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderChart();
  }

  bindEvents() {
    const siteSelect = document.getElementById('safety-site-select');
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

    const footprintSlider = document.getElementById('spec-footprint-slider');
    const tipangleSlider = document.getElementById('spec-tipangle-slider');
    const velocitySlider = document.getElementById('spec-velocity-slider');
    const accuracySlider = document.getElementById('spec-accuracy-slider');

    const updateSpecs = () => {
      this.landerSpecs.footprintDiameterM = parseFloat(footprintSlider.value);
      this.landerSpecs.maxTipOverAngleDeg = parseFloat(tipangleSlider.value);
      this.landerSpecs.touchdownVelocityMps = parseFloat(velocitySlider.value);
      this.landerSpecs.navigationAccuracyM = parseInt(accuracySlider.value);

      document.getElementById('spec-footprint-val').textContent = `${this.landerSpecs.footprintDiameterM} m`;
      document.getElementById('spec-tipangle-val').textContent = `${this.landerSpecs.maxTipOverAngleDeg}°`;
      document.getElementById('spec-velocity-val').textContent = `${this.landerSpecs.touchdownVelocityMps} m/s`;
      document.getElementById('spec-accuracy-val').textContent = `${this.landerSpecs.navigationAccuracyM} m`;

      // Re-render calculations dynamically
      this.render();
    };

    if (footprintSlider) footprintSlider.addEventListener('input', updateSpecs);
    if (tipangleSlider) tipangleSlider.addEventListener('input', updateSpecs);
    if (velocitySlider) velocitySlider.addEventListener('input', updateSpecs);
    if (accuracySlider) accuracySlider.addEventListener('input', updateSpecs);
  }

  renderChart() {
    if (!window.Chart) return;
    const canvas = document.getElementById('slope-distribution-chart');
    if (!canvas) return;

    const s = this.currentSite.slopeDistribution;

    if (this.chart) this.chart.destroy();
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Safe Flat Slope (< 5°)', 'Moderate Slope (5° – 10°)', 'Steep Hazard Slope (> 10°)'],
        datasets: [
          {
            label: 'Surface Area Coverage (%)',
            data: [s.flat, s.moderate, s.steep],
            backgroundColor: [
              'rgba(101, 217, 176, 0.8)', // safe green
              'rgba(210, 153, 34, 0.8)', // caution gold
              'rgba(248, 81, 73, 0.8)'   // danger red
            ],
            borderColor: ['#65D9B0', '#D29922', '#F85149'],
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 100,
            title: { display: true, text: 'Percentage of 1 km² Landing Zone (%)', color: '#94a3b8' },
            grid: { color: 'rgba(21, 36, 48, 0.7)' },
            ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono' } }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { family: 'IBM Plex Mono', size: 13, weight: 'bold' } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw}% of landing area`
            }
          }
        }
      }
    });
  }
}
