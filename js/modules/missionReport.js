/**
 * LUNAR NAV — Mission Report & Dossier Generator
 * Compiles executive NASA-style mission plans, site telemetry,
 * safety certifications, and exports to PDF, CSV, and structured JSON.
 */

import { LUNAR_LANDING_SITES, MISSION_STATUS } from '../data/lunarSites.js';
import { audioSystem } from './audioEffects.js';

export class MissionReportModule {
  constructor(containerId, initialSiteId = 'site-002') {
    this.container = document.getElementById(containerId);
    this.currentSite = LUNAR_LANDING_SITES.find(s => s.id === initialSiteId) || LUNAR_LANDING_SITES[0];
    this.includeComparison = true;
    this.includeCharts = true;
    this.reportTimestamp = new Date().toUTCString();

    this.render();
  }

  setSite(site) {
    this.currentSite = site;
    this.render();
  }

  render() {
    if (!this.container) return;

    const site = this.currentSite;

    this.container.innerHTML = `
      <div class="report-module-container">
        <!-- Configuration & Action Toolbar -->
        <div class="report-toolbar glass-panel">
          <div class="toolbar-left">
            <span class="hud-tag"><i class="fa-solid fa-file-contract"></i> NASA MISSION DOSSIER GENERATOR</span>
            <h2>Lunar Landing Site Assessment Report</h2>
            <p>Generate formal engineering and science site certification documentation suitable for flight readiness reviews.</p>
          </div>

          <div class="toolbar-actions">
            <div class="site-select-wrap">
              <label>Target Site:</label>
              <select id="report-site-select" class="hud-select">
                ${LUNAR_LANDING_SITES.map(s => `
                  <option value="${s.id}" ${s.id === site.id ? 'selected' : ''}>${s.name}</option>
                `).join('')}
              </select>
            </div>

            <button id="download-pdf-btn" class="btn-hud-primary glow-cyan">
              <i class="fa-solid fa-file-pdf"></i> Download PDF Dossier
            </button>

            <button id="export-json-btn" class="btn-hud-secondary">
              <i class="fa-solid fa-file-code"></i> Export JSON
            </button>

            <button id="export-csv-btn" class="btn-hud-secondary">
              <i class="fa-solid fa-file-csv"></i> Export CSV
            </button>

            <button id="print-report-btn" class="btn-hud-ghost">
              <i class="fa-solid fa-print"></i> Print
            </button>
          </div>
        </div>

        <!-- Printable / PDF Container -->
        <div id="mission-dossier-document" class="dossier-paper-container">
          <!-- Official NASA/Artemis Dossier Header -->
          <div class="dossier-official-header">
            <div class="agency-brand">
              <div class="agency-insignia">
                <i class="fa-solid fa-shuttle-space"></i>
              </div>
              <div class="agency-title">
                <h1>LUNAR NAV — EXPEDITION MISSION CONTROL</h1>
                <p>NASA ARTEMIS LUNAR LANDING SITE EVALUATION BOARD • SOUTH POLE CORRIDOR</p>
              </div>
            </div>
            <div class="dossier-classification">
              <span class="stamp-top">OFFICIAL MISSION RECORD</span>
              <span class="stamp-id">DOC: LNAV-${site.id.toUpperCase()}-2026-REV4</span>
              <span class="stamp-date">DATE (UTC): ${this.reportTimestamp}</span>
            </div>
          </div>

          <!-- Section 1: Executive Summary -->
          <div class="dossier-section">
            <h3 class="section-title"><span class="sec-num">1.0</span> EXECUTIVE MISSION SUMMARY</h3>
            <div class="summary-box">
              <p>
                This document certifies the technical, navigational, and scientific suitability assessment for 
                <strong>${site.name}</strong> (${site.scientificDesignation}), designated under <strong>${site.artemisCandidateRegion}</strong>.
                Based on high-resolution data from the Lunar Reconnaissance Orbiter (LOLA laser altimetry, Diviner thermal radiometer, and LAMP volatile mapping), 
                the candidate site attains an overall suitability index of <strong>${site.overallSuitability} / 100</strong>.
              </p>
              <div class="key-takeaways-grid">
                <div class="takeaway-pill">
                  <span class="lbl">Primary Role:</span>
                  <strong>${site.recommendedMissionType}</strong>
                </div>
                <div class="takeaway-pill">
                  <span class="lbl">Terrain Safety:</span>
                  <strong class="green">${site.slope}° Average Slope (${site.slopeDistribution.flat}% Flat)</strong>
                </div>
                <div class="takeaway-pill">
                  <span class="lbl">Solar Availability:</span>
                  <strong class="gold">${site.sunlightAvailability}% Illumination</strong>
                </div>
                <div class="takeaway-pill">
                  <span class="lbl">Direct Earth LOS:</span>
                  <strong class="cyan">${site.earthVisibility}% Continuous Link</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Geographic & Geodetic Telemetry -->
          <div class="dossier-section">
            <h3 class="section-title"><span class="sec-num">2.0</span> GEODETIC POSITIONING & TOPOGRAPHY</h3>
            <table class="dossier-table">
              <tbody>
                <tr>
                  <th>Target Latitude</th>
                  <td>${site.latitude.toFixed(4)}° S</td>
                  <th>Target Longitude</th>
                  <td>${site.longitude.toFixed(4)}° E</td>
                </tr>
                <tr>
                  <th>Elevation (LOLA Reference Datum)</th>
                  <td>+${site.elevation} m</td>
                  <th>Terrain Morphology</th>
                  <td>${site.terrainType}</td>
                </tr>
                <tr>
                  <th>Geological Epoch</th>
                  <td>${site.geologicalAge}</td>
                  <th>Crater Density</th>
                  <td>${site.craterDensity}</td>
                </tr>
                <tr>
                  <th>Landing Ellipse Major/Minor Axes</th>
                  <td>${site.landingEllipseKm[0]} km × ${site.landingEllipseKm[1]} km</td>
                  <th>Surface Roughness (Hurst Exponent)</th>
                  <td>${site.surfaceHazards.roughnessHurst}</td>
                </tr>
                <tr>
                  <th>GIS Cartography Verification</th>
                  <td colspan="3">
                    <a href="https://quickmap.lroc.im-ldi.com/?prjExtent=-6165547.0826951%2C-3751377.7422001%2C5834452.9173049%2C2088622.2577999&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 700; text-decoration: underline;">
                      <i class="fa-solid fa-satellite-dish"></i> NASA LROC / Intuitive Machines QuickMap GIS (Polar Stereographic • Stack 3314 • Earth Shadow Enabled)
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 3: Illumination & Environmental Profile -->
          <div class="dossier-section">
            <h3 class="section-title"><span class="sec-num">3.0</span> SOLAR ILLUMINATION & CRYOGENIC VOLATILES PROFILE</h3>
            <table class="dossier-table">
              <tbody>
                <tr>
                  <th>Cumulative Annual Sunlight</th>
                  <td class="gold"><strong>${site.sunlightAvailability}%</strong></td>
                  <th>Peak Continuous Light Window</th>
                  <td>${site.peakSunlightPeriod}</td>
                </tr>
                <tr>
                  <th>Maximum Shadow Window</th>
                  <td>${site.maxShadowDuration}</td>
                  <th>Sub-Solar Elevation Latitude</th>
                  <td>-1.54° (Grazing Polar Incidence)</td>
                </tr>
                <tr>
                  <th>PSR Cold Trap Distance</th>
                  <td class="cyan"><strong>${site.psrProximityKm} km</strong></td>
                  <th>Cold Trap Temperature</th>
                  <td>35 K to 45 K (-238°C)</td>
                </tr>
                <tr>
                  <th>Volatile Reserve Potential</th>
                  <td colspan="3">High (LCROSS Water Ice Analogs: H₂O, CO, NH₃, hydrocarbons)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 4: Direct-To-Earth Communication -->
          <div class="dossier-section">
            <h3 class="section-title"><span class="sec-num">4.0</span> EARTH COMMUNICATIONS & RF LINK TELEMETRY</h3>
            <table class="dossier-table">
              <tbody>
                <tr>
                  <th>Direct-To-Earth (DTE) LOS Time</th>
                  <td class="cyan"><strong>${site.earthVisibility}%</strong> of 27.21-day libration cycle</td>
                  <th>Earth Elevation Range</th>
                  <td>${site.earthElevationMin}° to +${site.earthElevationMax}°</td>
                </tr>
                <tr>
                  <th>One-Way Signal Latency</th>
                  <td>1.282 seconds (384,400 km)</td>
                  <th>Deep Space Network Support</th>
                  <td>Goldstone (DSS-14), Madrid (DSS-63), Canberra (DSS-43)</td>
                </tr>
                <tr>
                  <th>Orbital Relay Dependency</th>
                  <td colspan="3">
                    ${site.earthVisibility >= 90 
                      ? 'Minimal. Direct-to-Earth link remains open with positive elevation angle during &gt;90% of cycle.' 
                      : 'Recommended during negative southern libration dips when Earth drops below the local terrain horizon.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 5: Risk & Hazard Matrix -->
          <div class="dossier-section">
            <h3 class="section-title"><span class="sec-num">5.0</span> HAZARDS, SAFETY MARGINS & TOUCHDOWN ANALYSIS</h3>
            <div class="hazard-narrative">
              <p><strong>Detailed Hazard Evaluation:</strong> ${site.description}</p>
              
              <div class="advantages-challenges-block">
                <div class="dossier-subbox">
                  <h4><i class="fa-solid fa-circle-check"></i> Flight Certified Advantages</h4>
                  <ul>
                    ${site.advantages.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                </div>
                <div class="dossier-subbox">
                  <h4><i class="fa-solid fa-triangle-exclamation"></i> Identified Risks & Hazards</h4>
                  <ul>
                    ${site.challenges.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 6: Candidate Comparison Overview -->
          <div class="dossier-section">
            <h3 class="section-title"><span class="sec-num">6.0</span> SOUTH POLE CANDIDATE SITES COMPARISON BENCHMARK</h3>
            <table class="dossier-table comparison-overview-table">
              <thead>
                <tr>
                  <th>Site Designation</th>
                  <th>Coords</th>
                  <th>Elevation</th>
                  <th>Slope</th>
                  <th>Sunlight</th>
                  <th>Earth LOS</th>
                  <th>PSR Dist</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                ${LUNAR_LANDING_SITES.slice(0, 6).map(s => `
                  <tr class="${s.id === site.id ? 'highlight-target' : ''}">
                    <td><strong>${s.name}</strong></td>
                    <td>${s.latitude.toFixed(1)}°S, ${s.longitude.toFixed(1)}°E</td>
                    <td>+${s.elevation}m</td>
                    <td>${s.slope}°</td>
                    <td>${s.sunlightAvailability}%</td>
                    <td>${s.earthVisibility}%</td>
                    <td>${s.psrProximityKm} km</td>
                    <td><strong>${s.overallSuitability}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Official Sign-off & Verification Footer -->
          <div class="dossier-signoff">
            <div class="signoff-col">
              <span class="sig-line"></span>
              <span class="sig-title">Mission Director, Artemis Expedition</span>
              <span class="sig-sub">NASA Johnson Space Center (JSC)</span>
            </div>
            <div class="signoff-col">
              <span class="sig-line"></span>
              <span class="sig-title">Lead Navigation & Terrain Analyst</span>
              <span class="sig-sub">NASA Jet Propulsion Laboratory (JPL)</span>
            </div>
            <div class="signoff-col seal-col">
              <div class="nasa-seal-badge">
                <i class="fa-solid fa-certificate"></i>
                <span>VERIFIED LOLA v4.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const siteSelect = document.getElementById('report-site-select');
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

    // PDF Download via html2pdf or fallback
    const pdfBtn = document.getElementById('download-pdf-btn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => this.downloadPDF());
    }

    // JSON Export
    const jsonBtn = document.getElementById('export-json-btn');
    if (jsonBtn) {
      jsonBtn.addEventListener('click', () => this.exportJSON());
    }

    // CSV Export
    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => this.exportCSV());
    }

    // Print button
    const printBtn = document.getElementById('print-report-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        audioSystem.playClick();
        window.print();
      });
    }
  }

  downloadPDF() {
    audioSystem.playClick();
    const element = document.getElementById('mission-dossier-document');
    if (!element) return;

    if (window.html2pdf) {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `NASA_LUNAR_NAV_${this.currentSite.name.replace(/\s+/g, '_')}_Dossier.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(element).save();
    } else {
      // Clean fallback to browser print dialog configured for save to PDF
      window.print();
    }
  }

  exportJSON() {
    audioSystem.playClick();
    const data = {
      mission: MISSION_STATUS.missionName,
      generatedAtUtc: new Date().toISOString(),
      evaluatedSite: this.currentSite,
      allSouthPoleCandidates: LUNAR_LANDING_SITES
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUNAR_NAV_${this.currentSite.name.replace(/\s+/g, '_')}_telemetry.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportCSV() {
    audioSystem.playClick();
    const headers = [
      'Site ID',
      'Name',
      'Designation',
      'Artemis Region',
      'Latitude',
      'Longitude',
      'Elevation (m)',
      'Slope (deg)',
      'Sunlight (%)',
      'Earth LOS (%)',
      'PSR Proximity (km)',
      'Scientific Value',
      'Overall Suitability'
    ];

    const rows = LUNAR_LANDING_SITES.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.scientificDesignation}"`,
      `"${s.artemisCandidateRegion}"`,
      s.latitude,
      s.longitude,
      s.elevation,
      s.slope,
      s.sunlightAvailability,
      s.earthVisibility,
      s.psrProximityKm,
      s.scientificValue,
      s.overallSuitability
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LUNAR_NAV_Candidate_Sites_Matrix.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
