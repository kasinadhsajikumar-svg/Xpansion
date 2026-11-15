/**
 * LUNAR NAV — Multi-Site Comparison Dashboard & Recommendation Engine
 * Multi-criteria decision analysis (MCDA) with dynamic priority weighting,
 * interactive Chart.js Radar and Bar comparisons, and explainable AI-style recommendations.
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import { audioSystem } from './audioEffects.js';

export class SiteComparisonModule {
  constructor(containerId, onSiteSelected) {
    this.container = document.getElementById(containerId);
    this.onSiteSelected = onSiteSelected;
    // Default 3 compared sites
    this.comparedSiteIds = ['site-001', 'site-002', 'site-004']; // Shackleton, Malapert, Mons Mouton
    this.radarChart = null;
    this.barChart = null;

    // Mission Priority Weights (0 to 100)
    this.weights = {
      safety: 80,       // Terrain slope & flat area
      sunlight: 85,     // Solar illumination
      comm: 90,         // Direct-to-Earth line-of-sight
      science: 75,      // PSR proximity & water ice
      hazard: 70        // Boulder & roughness avoidance
    };

    this.render();
  }

  setComparedSites(ids) {
    this.comparedSiteIds = ids;
    this.updateCharts();
    this.updateTable();
    this.updateRecommendation();
  }

  addSiteToCompare(siteId) {
    if (!this.comparedSiteIds.includes(siteId)) {
      if (this.comparedSiteIds.length >= 4) {
        this.comparedSiteIds.shift(); // keep max 4 sites
      }
      this.comparedSiteIds.push(siteId);
      audioSystem.playClick();
      this.render();
    }
  }

  removeSiteFromCompare(siteId) {
    if (this.comparedSiteIds.length <= 2) {
      alert("At least two candidate landing sites are required for comparison.");
      return;
    }
    this.comparedSiteIds = this.comparedSiteIds.filter(id => id !== siteId);
    audioSystem.playClick();
    this.render();
  }

  /**
   * Calculates dynamic weighted score based on mission priorities
   */
  calculateDynamicScore(site) {
    // Normalize parameters to 0-100:
    // 1. Slope Safety: 0° is 100, 15° is 0
    const slopeScore = Math.max(0, Math.min(100, (1 - site.slope / 15) * 100));
    // 2. Sunlight Score
    const sunScore = site.sunlightAvailability;
    // 3. Comm Score
    const commScore = site.earthVisibility;
    // 4. Science Score
    const scienceScore = site.scientificValue;
    // 5. Hazard Avoidance Score: (100 - riskScore)
    const hazardScore = 100 - site.surfaceHazards.riskScore;

    const totalWeight =
      this.weights.safety +
      this.weights.sunlight +
      this.weights.comm +
      this.weights.science +
      this.weights.hazard;

    const weightedTotal =
      slopeScore * this.weights.safety +
      sunScore * this.weights.sunlight +
      commScore * this.weights.comm +
      scienceScore * this.weights.science +
      hazardScore * this.weights.hazard;

    return Math.round(weightedTotal / (totalWeight || 1));
  }

  render() {
    if (!this.container) return;

    const allSites = LUNAR_LANDING_SITES;
    const comparedSites = this.comparedSiteIds
      .map(id => allSites.find(s => s.id === id))
      .filter(Boolean);

    this.container.innerHTML = `
      <div class="comparison-module-container">
        <!-- Header & Site Selector Chips -->
        <div class="comparison-header glass-panel">
          <div class="comp-title-bar">
            <div>
              <span class="hud-tag">MULTI-CRITERIA DECISION ANALYSIS (MCDA)</span>
              <h2>Candidate Landing Site Comparison</h2>
              <p>Compare topography, illumination, DTE communications, and volatile accessibility across candidate zones.</p>
            </div>
            <div class="site-chips-selector">
              <span class="selector-lbl">Select Sites to Compare (2 to 4):</span>
              <div class="chips-row">
                ${allSites.map(s => {
                  const isChecked = this.comparedSiteIds.includes(s.id);
                  return `
                    <button class="site-chip ${isChecked ? 'active' : ''}" data-chip-id="${s.id}">
                      <i class="fa-solid ${isChecked ? 'fa-check' : 'fa-plus'}"></i> ${s.name.split(' ')[0]}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Priority Weighting Controls -->
        <div class="priority-weights-card glass-panel glow-cyan">
          <div class="weights-header">
            <h4><i class="fa-solid fa-sliders"></i> Configurable Mission Priority Weights</h4>
            <span class="weights-hint">Adjust priorities to simulate Crewed Artemis vs Robotic Prospecting requirements</span>
          </div>
          <div class="weights-sliders-row">
            <div class="weight-control">
              <div class="w-label-wrap">
                <span><i class="fa-solid fa-mountain"></i> Terrain Slope Safety</span>
                <span id="w-safety-val" class="w-val">${this.weights.safety}%</span>
              </div>
              <input type="range" class="weight-slider" id="w-safety-slider" min="0" max="100" value="${this.weights.safety}">
            </div>

            <div class="weight-control">
              <div class="w-label-wrap">
                <span><i class="fa-solid fa-sun"></i> Solar Power / Illumination</span>
                <span id="w-sunlight-val" class="w-val">${this.weights.sunlight}%</span>
              </div>
              <input type="range" class="weight-slider" id="w-sunlight-slider" min="0" max="100" value="${this.weights.sunlight}">
            </div>

            <div class="weight-control">
              <div class="w-label-wrap">
                <span><i class="fa-solid fa-earth-americas"></i> Direct Earth Link (DTE)</span>
                <span id="w-comm-val" class="w-val">${this.weights.comm}%</span>
              </div>
              <input type="range" class="weight-slider" id="w-comm-slider" min="0" max="100" value="${this.weights.comm}">
            </div>

            <div class="weight-control">
              <div class="w-label-wrap">
                <span><i class="fa-solid fa-flask"></i> Science / Volatile Ice</span>
                <span id="w-science-val" class="w-val">${this.weights.science}%</span>
              </div>
              <input type="range" class="weight-slider" id="w-science-slider" min="0" max="100" value="${this.weights.science}">
            </div>

            <div class="weight-control">
              <div class="w-label-wrap">
                <span><i class="fa-solid fa-shield-halved"></i> Boulder & Hazard Margin</span>
                <span id="w-hazard-val" class="w-val">${this.weights.hazard}%</span>
              </div>
              <input type="range" class="weight-slider" id="w-hazard-slider" min="0" max="100" value="${this.weights.hazard}">
            </div>
          </div>
        </div>

        <!-- Explainable Recommendation Card -->
        <div id="mission-recommendation-card" class="recommendation-card glass-panel">
          <!-- Dynamically populated -->
        </div>

        <!-- Charts Row -->
        <div class="comparison-charts-grid">
          <!-- Radar Chart -->
          <div class="chart-card glass-panel">
            <div class="chart-header">
              <h4><i class="fa-solid fa-hexagon-nodes"></i> Multi-Criteria Performance Radar</h4>
              <span class="chart-subtitle">6-Axis Comparative Trade-off Space</span>
            </div>
            <div class="chart-wrapper radar-wrapper">
              <canvas id="comparison-radar-chart"></canvas>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="chart-card glass-panel">
            <div class="chart-header">
              <h4><i class="fa-solid fa-chart-column"></i> Weighted Mission Suitability Breakdown</h4>
              <span class="chart-subtitle">Dynamic Recalculation from Active Weights</span>
            </div>
            <div class="chart-wrapper">
              <canvas id="comparison-bar-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Detailed Comparison Matrix Table -->
        <div class="comparison-table-card glass-panel">
          <div class="table-header">
            <h4><i class="fa-solid fa-table-list"></i> Scientific & Engineering Telemetry Matrix</h4>
          </div>
          <div class="table-responsive">
            <table class="hud-matrix-table" id="comparison-matrix-table">
              <!-- Dynamically populated -->
            </table>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderCharts(comparedSites);
    this.updateTable(comparedSites);
    this.updateRecommendation(comparedSites);
  }

  bindEvents() {
    // Site Chips selector
    const chips = this.container.querySelectorAll('.site-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const siteId = chip.getAttribute('data-chip-id');
        if (this.comparedSiteIds.includes(siteId)) {
          this.removeSiteFromCompare(siteId);
        } else {
          this.addSiteToCompare(siteId);
        }
      });
    });

    // Weight sliders
    const setupWeight = (sliderId, valId, key) => {
      const slider = document.getElementById(sliderId);
      const val = document.getElementById(valId);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.weights[key] = parseInt(e.target.value);
          if (val) val.textContent = `${this.weights[key]}%`;
          this.updateCalculations();
        });
      }
    };

    setupWeight('w-safety-slider', 'w-safety-val', 'safety');
    setupWeight('w-sunlight-slider', 'w-sunlight-val', 'sunlight');
    setupWeight('w-comm-slider', 'w-comm-val', 'comm');
    setupWeight('w-science-slider', 'w-science-val', 'science');
    setupWeight('w-hazard-slider', 'w-hazard-val', 'hazard');
  }

  updateCalculations() {
    const comparedSites = this.comparedSiteIds
      .map(id => LUNAR_LANDING_SITES.find(s => s.id === id))
      .filter(Boolean);

    this.updateCharts(comparedSites);
    this.updateTable(comparedSites);
    this.updateRecommendation(comparedSites);
  }

  renderCharts(comparedSites) {
    if (!window.Chart) return;

    const radarCanvas = document.getElementById('comparison-radar-chart');
    const barCanvas = document.getElementById('comparison-bar-chart');
    if (!radarCanvas || !barCanvas) return;

    // Palette for compared sites
    const colors = [
      { border: '#36D6D0', bg: 'rgba(54, 214, 208, 0.2)' },
      { border: '#D29922', bg: 'rgba(210, 153, 34, 0.2)' },
      { border: '#65D9B0', bg: 'rgba(101, 217, 176, 0.2)' },
      { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.25)' }
    ];

    // --- 1. Radar Chart ---
    const radarLabels = [
      'Slope Safety',
      'Illumination',
      'Earth Direct LOS',
      'Science Merit',
      'Hazard Margin',
      'Flat Landing Area'
    ];

    const radarDatasets = comparedSites.map((site, i) => {
      const c = colors[i % colors.length];
      const slopeScore = Math.max(0, Math.min(100, (1 - site.slope / 15) * 100));
      const hazardScore = 100 - site.surfaceHazards.riskScore;
      const flatAreaScore = site.slopeDistribution.flat;

      return {
        label: site.name,
        data: [
          Math.round(slopeScore),
          Math.round(site.sunlightAvailability),
          Math.round(site.earthVisibility),
          site.scientificValue,
          Math.round(hazardScore),
          Math.round(flatAreaScore)
        ],
        borderColor: c.border,
        backgroundColor: c.bg,
        borderWidth: 2,
        pointBackgroundColor: c.border,
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    if (this.radarChart) this.radarChart.destroy();
    this.radarChart = new Chart(radarCanvas, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: radarDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(54, 214, 208, 0.2)' },
            grid: { color: 'rgba(21, 36, 48, 0.7)' },
            pointLabels: {
              color: '#cbd5e1',
              font: { family: 'IBM Plex Mono', size: 12, weight: 'bold' }
            },
            ticks: {
              color: '#64748b',
              backdropColor: 'transparent',
              stepSize: 20
            },
            min: 0,
            max: 100
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e2e8f0',
              font: { family: 'IBM Plex Mono', size: 12 },
              usePointStyle: true
            }
          }
        }
      }
    });

    // --- 2. Bar Chart ---
    const barLabels = comparedSites.map(s => s.name.split(' (')[0]);
    const baselineScores = comparedSites.map(s => s.overallSuitability);
    const dynamicScores = comparedSites.map(s => this.calculateDynamicScore(s));

    if (this.barChart) this.barChart.destroy();
    this.barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [
          {
            label: 'Baseline NASA Index',
            data: baselineScores,
            backgroundColor: 'rgba(100, 116, 139, 0.65)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Weighted Priority Score',
            data: dynamicScores,
            backgroundColor: 'rgba(54, 214, 208, 0.8)', borderColor: '#36D6D0',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 50,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { family: 'IBM Plex Mono', weight: 'bold' } }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#e2e8f0', font: { family: 'IBM Plex Mono' } }
          }
        }
      }
    });
  }

  updateCharts(comparedSites) {
    if (!comparedSites) {
      comparedSites = this.comparedSiteIds
        .map(id => LUNAR_LANDING_SITES.find(s => s.id === id))
        .filter(Boolean);
    }
    this.renderCharts(comparedSites);
  }

  updateTable(comparedSites) {
    if (!comparedSites) {
      comparedSites = this.comparedSiteIds
        .map(id => LUNAR_LANDING_SITES.find(s => s.id === id))
        .filter(Boolean);
    }

    const table = document.getElementById('comparison-matrix-table');
    if (!table) return;

    table.innerHTML = `
      <thead>
        <tr>
          <th>Evaluation Parameter</th>
          ${comparedSites.map(s => `<th><span class="th-site-name">${s.name}</span><br><small class="cyan">${s.scientificDesignation}</small></th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr class="highlight-row">
          <td><i class="fa-solid fa-gauge-high"></i> Dynamic Priority Score</td>
          ${comparedSites.map(s => {
            const score = this.calculateDynamicScore(s);
            return `<td><span class="matrix-badge cyan">${score} / 100</span></td>`;
          }).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-location-pin"></i> Coordinates</td>
          ${comparedSites.map(s => `<td>${s.latitude.toFixed(2)}° S, ${s.longitude.toFixed(2)}° E</td>`).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-mountain"></i> Elevation (LOLA Datum)</td>
          ${comparedSites.map(s => `<td>+${s.elevation} m</td>`).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-arrows-split-up-and-left"></i> Average Terrain Slope</td>
          ${comparedSites.map(s => {
            const cls = s.slope < 5.0 ? 'safe-text' : (s.slope < 7.0 ? 'caution-text' : 'hazard-text');
            return `<td class="${cls}"><strong>${s.slope}°</strong> (${s.slopeDistribution.flat}% flat area)</td>`;
          }).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-sun"></i> Annual Sunlight Availability</td>
          ${comparedSites.map(s => `<td class="gold-text"><strong>${s.sunlightAvailability}%</strong></td>`).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-earth-americas"></i> Direct Earth Visibility (LOS)</td>
          ${comparedSites.map(s => `<td class="cyan-text"><strong>${s.earthVisibility}%</strong></td>`).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-snowflake"></i> PSR (Water Ice) Proximity</td>
          ${comparedSites.map(s => `<td><strong>${s.psrProximityKm} km</strong></td>`).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-triangle-exclamation"></i> Surface Hazard Level</td>
          ${comparedSites.map(s => `<td>${s.surfaceHazards.hazardLevel} (Risk: ${s.surfaceHazards.riskScore}/100)</td>`).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-bullseye"></i> Landing Ellipse</td>
          ${comparedSites.map(s => `<td>${s.landingEllipseKm[0]} × ${s.landingEllipseKm[1]} km</td>`).join('')}
        </tr>
        <tr>
          <td><i class="fa-solid fa-rocket"></i> Recommended Mission</td>
          ${comparedSites.map(s => `<td><small>${s.recommendedMissionType}</small></td>`).join('')}
        </tr>
      </tbody>
    `;
  }

  updateRecommendation(comparedSites) {
    if (!comparedSites) {
      comparedSites = this.comparedSiteIds
        .map(id => LUNAR_LANDING_SITES.find(s => s.id === id))
        .filter(Boolean);
    }

    const card = document.getElementById('mission-recommendation-card');
    if (!card || comparedSites.length === 0) return;

    // Calculate dynamic scores and sort
    const ranked = [...comparedSites].map(site => ({
      site,
      dynamicScore: this.calculateDynamicScore(site)
    })).sort((a, b) => b.dynamicScore - a.dynamicScore);

    const winner = ranked[0].site;
    const runnerUp = ranked[1] ? ranked[1].site : null;

    // Build explainable justification
    let rationale = '';
    if (this.weights.safety > 80 && winner.slope < 5.0) {
      rationale += `Because Terrain Slope Safety is weighted heavily (${this.weights.safety}%), ${winner.name} achieves the highest rank due to its exceptionally smooth landing topography (${winner.slope}° slope with ${winner.slopeDistribution.flat}% flat terrain). `;
    } else if (this.weights.comm > 85 && winner.earthVisibility > 90) {
      rationale += `With Direct Earth Communications prioritized (${this.weights.comm}%), ${winner.name} is the standout selection providing ${winner.earthVisibility}% continuous Line-of-Sight with zero deep blackout windows. `;
    } else if (this.weights.science > 85 && winner.psrProximityKm < 1.0) {
      rationale += `Given the heavy weight on Science and Water Ice prospecting (${this.weights.science}%), ${winner.name} excels with an immediate ${winner.psrProximityKm} km rover traverse to cryogenic volatiles preserved in permanent shadow. `;
    } else {
      rationale += `${winner.name} provides the most balanced multi-criteria profile with an overall dynamic score of ${ranked[0].dynamicScore}/100 across illumination, RF line-of-sight, and engineering safety margins. `;
    }

    if (runnerUp) {
      rationale += `Secondary alternative: <strong>${runnerUp.name}</strong> (Score: ${ranked[1].dynamicScore}/100).`;
    }

    card.innerHTML = `
      <div class="rec-badge-wrap">
        <span class="rec-pill"><i class="fa-solid fa-award"></i> OPTIMAL RECOMMENDATION</span>
        <h3 class="rec-title">${winner.name}</h3>
        <span class="rec-score">${ranked[0].dynamicScore} <small>/ 100 Index</small></span>
      </div>
      <div class="rec-body">
        <p class="rec-rationale">${rationale}</p>
        <div class="rec-actions">
          <button id="rec-select-btn" class="btn-hud-primary" data-winner-id="${winner.id}">
            <i class="fa-solid fa-crosshairs"></i> Set as Primary Mission Target
          </button>
        </div>
      </div>
    `;

    const selectBtn = document.getElementById('rec-select-btn');
    if (selectBtn) {
      selectBtn.addEventListener('click', () => {
        audioSystem.playTargetLock();
        if (this.onSiteSelected) {
          this.onSiteSelected(winner);
        }
      });
    }
  }
}
