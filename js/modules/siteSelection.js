/**
 * LUNAR NAV — Landing Site Selection & Exploration Catalog Module
 * Interactive catalog with real-time filtering, search, sorting, and inspector modal.
 */

import { LUNAR_LANDING_SITES } from '../data/lunarSites.js';
import { audioSystem } from './audioEffects.js';

export class SiteSelectionModule {
  constructor(containerId, onSiteSelected) {
    this.container = document.getElementById(containerId);
    this.onSiteSelected = onSiteSelected;
    this.currentSites = [...LUNAR_LANDING_SITES];
    this.selectedSiteId = 'site-002'; // Default: Malapert Mountain
    this.searchTerm = '';
    this.maxSlopeFilter = 15; // deg
    this.minSunFilter = 0; // %
    this.minEarthFilter = 0; // %
    this.sortBy = 'overallSuitability'; // 'overallSuitability', 'elevation', 'slope', 'sunlightAvailability', 'earthVisibility'

    this.render();
  }

  setSites(sites) {
    this.currentSites = sites;
    this.applyFiltersAndSort();
  }

  setSelectedSite(siteId) {
    this.selectedSiteId = siteId;
    this.updateCardSelection();
  }

  applyFiltersAndSort() {
    let filtered = LUNAR_LANDING_SITES.filter(site => {
      // Search
      const matchSearch =
        site.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        site.scientificDesignation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        site.artemisCandidateRegion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        site.terrainType.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Sliders / Criteria
      const matchSlope = site.slope <= this.maxSlopeFilter;
      const matchSun = site.sunlightAvailability >= this.minSunFilter;
      const matchEarth = site.earthVisibility >= this.minEarthFilter;

      return matchSearch && matchSlope && matchSun && matchEarth;
    });

    // Sort
    filtered.sort((a, b) => {
      if (this.sortBy === 'slope') {
        return a.slope - b.slope; // lower slope is better
      }
      return b[this.sortBy] - a[this.sortBy]; // higher is better
    });

    this.currentSites = filtered;
    this.renderGrid();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="site-catalog-container">
        <!-- Controls Bar -->
        <div class="catalog-controls glass-panel">
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="site-search-input" placeholder="Search candidate sites, craters, or Artemis regions..." autocomplete="off">
            <button id="site-search-clear" class="btn-icon-sm" title="Clear search"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="filter-controls-row">
            <div class="filter-slider-group">
              <label><i class="fa-solid fa-mountain"></i> Max Slope: <span id="slope-filter-val" class="highlight-val">15°</span></label>
              <input type="range" id="filter-slope-slider" min="3" max="15" step="0.5" value="15">
            </div>

            <div class="filter-slider-group">
              <label><i class="fa-solid fa-sun"></i> Min Sunlight: <span id="sun-filter-val" class="highlight-val">0%</span></label>
              <input type="range" id="filter-sun-slider" min="0" max="85" step="5" value="0">
            </div>

            <div class="filter-slider-group">
              <label><i class="fa-solid fa-earth-americas"></i> Min Earth LOS: <span id="earth-filter-val" class="highlight-val">0%</span></label>
              <input type="range" id="filter-earth-slider" min="0" max="90" step="5" value="0">
            </div>

            <div class="filter-sort-group">
              <label><i class="fa-solid fa-arrow-down-wide-short"></i> Sort By:</label>
              <select id="catalog-sort-select" class="hud-select">
                <option value="overallSuitability">Suitability Score</option>
                <option value="slope">Slope (Flattest First)</option>
                <option value="elevation">Elevation (Highest)</option>
                <option value="sunlightAvailability">Sunlight Availability</option>
                <option value="earthVisibility">Earth Direct Visibility</option>
                <option value="scientificValue">Scientific Value</option>
              </select>
            </div>

            <button id="reset-filters-btn" class="btn-hud-ghost"><i class="fa-solid fa-rotate-left"></i> Reset</button>
          </div>

          <div class="catalog-meta-status">
            <span>Showing <strong id="catalog-count">${this.currentSites.length}</strong> of ${LUNAR_LANDING_SITES.length} NASA South Pole Candidate Regions</span>
            <span class="hud-indicator active"><span class="pulse-dot"></span> LOLA 5m/px Topography Active</span>
          </div>
        </div>

        <!-- Site Cards Grid -->
        <div id="site-cards-grid" class="site-cards-grid">
          <!-- Dynamic cards inserted here -->
        </div>
      </div>
    `;

    this.bindControlEvents();
    this.renderGrid();
  }

  bindControlEvents() {
    const searchInput = document.getElementById('site-search-input');
    const clearBtn = document.getElementById('site-search-clear');
    const slopeSlider = document.getElementById('filter-slope-slider');
    const slopeVal = document.getElementById('slope-filter-val');
    const sunSlider = document.getElementById('filter-sun-slider');
    const sunVal = document.getElementById('sun-filter-val');
    const earthSlider = document.getElementById('filter-earth-slider');
    const earthVal = document.getElementById('earth-filter-val');
    const sortSelect = document.getElementById('catalog-sort-select');
    const resetBtn = document.getElementById('reset-filters-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.applyFiltersAndSort();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchTerm = '';
        this.applyFiltersAndSort();
      });
    }

    if (slopeSlider) {
      slopeSlider.addEventListener('input', (e) => {
        this.maxSlopeFilter = parseFloat(e.target.value);
        if (slopeVal) slopeVal.textContent = `${this.maxSlopeFilter}°`;
        this.applyFiltersAndSort();
      });
    }

    if (sunSlider) {
      sunSlider.addEventListener('input', (e) => {
        this.minSunFilter = parseFloat(e.target.value);
        if (sunVal) sunVal.textContent = `${this.minSunFilter}%`;
        this.applyFiltersAndSort();
      });
    }

    if (earthSlider) {
      earthSlider.addEventListener('input', (e) => {
        this.minEarthFilter = parseFloat(e.target.value);
        if (earthVal) earthVal.textContent = `${this.minEarthFilter}%`;
        this.applyFiltersAndSort();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        audioSystem.playClick();
        this.applyFiltersAndSort();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        audioSystem.playClick();
        this.searchTerm = '';
        this.maxSlopeFilter = 15;
        this.minSunFilter = 0;
        this.minEarthFilter = 0;
        this.sortBy = 'overallSuitability';

        if (searchInput) searchInput.value = '';
        if (slopeSlider) slopeSlider.value = '15';
        if (slopeVal) slopeVal.textContent = '15°';
        if (sunSlider) sunSlider.value = '0';
        if (sunVal) sunVal.textContent = '0%';
        if (earthSlider) earthSlider.value = '0';
        if (earthVal) earthVal.textContent = '0%';
        if (sortSelect) sortSelect.value = 'overallSuitability';

        this.applyFiltersAndSort();
      });
    }
  }

  renderGrid() {
    const grid = document.getElementById('site-cards-grid');
    const countEl = document.getElementById('catalog-count');
    if (countEl) countEl.textContent = this.currentSites.length;
    if (!grid) return;

    if (this.currentSites.length === 0) {
      grid.innerHTML = `
        <div class="empty-results-box glass-panel">
          <i class="fa-solid fa-satellite-dish empty-icon"></i>
          <h3>No Candidate Sites Match Current Filters</h3>
          <p>Try loosening the slope threshold or reducing the illumination and line-of-sight constraints.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.currentSites.map(site => {
      const isSelected = site.id === this.selectedSiteId;
      const scoreClass = site.overallSuitability >= 94 ? 'score-excellent' : (site.overallSuitability >= 88 ? 'score-good' : 'score-fair');
      const slopeSafetyClass = site.slope < 5.0 ? 'badge-safe' : (site.slope < 7.5 ? 'badge-caution' : 'badge-hazard');

      return `
        <div class="site-card glass-panel ${isSelected ? 'selected' : ''}" data-site-id="${site.id}">
          <div class="site-card-header">
            <div class="site-title-wrap">
              <span class="site-tag">${site.scientificDesignation}</span>
              <h3 class="site-card-name">${site.name}</h3>
              <span class="artemis-region">${site.artemisCandidateRegion}</span>
            </div>
            <div class="suitability-score-badge ${scoreClass}">
              <span class="score-num">${site.overallSuitability}</span>
              <span class="score-label">INDEX</span>
            </div>
          </div>

          <div class="site-card-coords">
            <span><i class="fa-solid fa-location-crosshairs"></i> ${site.latitude.toFixed(2)}° S, ${site.longitude.toFixed(2)}° E</span>
            <span><i class="fa-solid fa-mountain"></i> ${site.elevation > 0 ? `+${site.elevation}m` : `${site.elevation}m`}</span>
          </div>

          <p class="site-card-desc">${site.description.slice(0, 140)}...</p>

          <div class="site-metrics-grid">
            <div class="metric-cell">
              <span class="m-label"><i class="fa-solid fa-sun"></i> Sunlight</span>
              <span class="m-val gold">${site.sunlightAvailability}%</span>
              <div class="mini-bar-track"><div class="mini-bar-fill gold" style="width: ${site.sunlightAvailability}%"></div></div>
            </div>

            <div class="metric-cell">
              <span class="m-label"><i class="fa-solid fa-earth-americas"></i> Earth LOS</span>
              <span class="m-val cyan">${site.earthVisibility}%</span>
              <div class="mini-bar-track"><div class="mini-bar-fill cyan" style="width: ${site.earthVisibility}%"></div></div>
            </div>

            <div class="metric-cell">
              <span class="m-label"><i class="fa-solid fa-arrows-split-up-and-left"></i> Slope</span>
              <span class="m-val ${slopeSafetyClass}">${site.slope}°</span>
              <div class="mini-bar-track"><div class="mini-bar-fill ${slopeSafetyClass}" style="width: ${Math.min(100, (site.slope / 15) * 100)}%"></div></div>
            </div>

            <div class="metric-cell">
              <span class="m-label"><i class="fa-solid fa-snowflake"></i> PSR Prox</span>
              <span class="m-val purple">${site.psrProximityKm} km</span>
              <span class="sub-text">Cold Trap</span>
            </div>
          </div>

          <div class="site-card-actions">
            <button class="btn-hud-select ${isSelected ? 'active' : ''}" data-action="select" data-site-id="${site.id}">
              <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-crosshairs'}"></i> ${isSelected ? 'SELECTED TARGET' : 'SELECT SITE'}
            </button>
            <button class="btn-hud-inspect" data-action="inspect" data-site-id="${site.id}" title="Deep Telemetry Inspector">
              <i class="fa-solid fa-chart-line"></i> INSPECT
            </button>
            <a href="https://quickmap.lroc.im-ldi.com/?prjExtent=-6165547.0826951%2C-3751377.7422001%2C5834452.9173049%2C2088622.2577999&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn-hud-qm" 
               title="View in LROC QuickMap GIS"
               onclick="event.stopPropagation()">
              <i class="fa-solid fa-satellite-dish"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Bind card click events
    grid.querySelectorAll('.site-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent if inspect button was clicked
        if (e.target.closest('[data-action="inspect"]')) return;
        const siteId = card.getAttribute('data-site-id');
        this.selectSite(siteId);
      });
    });

    grid.querySelectorAll('[data-action="inspect"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const siteId = btn.getAttribute('data-site-id');
        this.openInspectorModal(siteId);
      });
    });
  }

  selectSite(siteId) {
    this.selectedSiteId = siteId;
    audioSystem.playTargetLock();
    this.updateCardSelection();

    const site = LUNAR_LANDING_SITES.find(s => s.id === siteId);
    if (site && this.onSiteSelected) {
      this.onSiteSelected(site);
    }
  }

  updateCardSelection() {
    const cards = document.querySelectorAll('.site-card');
    cards.forEach(card => {
      const id = card.getAttribute('data-site-id');
      const isSelected = id === this.selectedSiteId;
      card.classList.toggle('selected', isSelected);

      const selectBtn = card.querySelector('[data-action="select"]');
      if (selectBtn) {
        selectBtn.classList.toggle('active', isSelected);
        selectBtn.innerHTML = `<i class="fa-solid ${isSelected ? 'fa-check' : 'fa-crosshairs'}"></i> ${isSelected ? 'SELECTED TARGET' : 'SELECT SITE'}`;
      }
    });
  }

  openInspectorModal(siteId) {
    const site = LUNAR_LANDING_SITES.find(s => s.id === siteId);
    if (!site) return;

    audioSystem.playScan();

    let modal = document.getElementById('site-inspector-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'site-inspector-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog glass-panel glow-cyan">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="hud-tag">MISSION TELEMETRY DOSSIER</span>
            <h2>${site.name}</h2>
            <span class="artemis-subtitle">${site.scientificDesignation} • ${site.artemisCandidateRegion}</span>
          </div>
          <button id="modal-close-btn" class="btn-close"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body">
          <div class="inspector-summary-banner">
            <div class="summary-stat">
              <span class="lbl">SUITABILITY SCORE</span>
              <span class="val cyan large">${site.overallSuitability} / 100</span>
            </div>
            <div class="summary-stat">
              <span class="lbl">COORDINATES</span>
              <span class="val">${site.latitude.toFixed(2)}° S, ${site.longitude.toFixed(2)}° E</span>
            </div>
            <div class="summary-stat">
              <span class="lbl">DATUM ELEVATION</span>
              <span class="val">+${site.elevation} m (LOLA)</span>
            </div>
            <div class="summary-stat">
              <span class="lbl">TERRAIN SLOPE</span>
              <span class="val gold">${site.slope}° avg</span>
            </div>
          </div>

          <div class="inspector-grid">
            <div class="inspector-col">
              <h4><i class="fa-solid fa-circle-info"></i> Terrain & Hazards Breakdown</h4>
              <ul class="dossier-list">
                <li><strong>Terrain Morphology:</strong> ${site.terrainType}</li>
                <li><strong>Geological Epoch:</strong> ${site.geologicalAge}</li>
                <li><strong>Crater Density:</strong> ${site.craterDensity}</li>
                <li><strong>Surface Boulder Abundance:</strong> ${site.surfaceHazards.boulderAbundance}</li>
                <li><strong>Hurst Roughness Exponent:</strong> ${site.surfaceHazards.roughnessHurst}</li>
                <li><strong>Landing Ellipse Tolerance:</strong> ${site.landingEllipseKm[0]} km × ${site.landingEllipseKm[1]} km</li>
                <li><strong>Slope Distribution:</strong> ${site.slopeDistribution.flat}% Flat (&lt;5°), ${site.slopeDistribution.moderate}% Moderate, ${site.slopeDistribution.steep}% Steep</li>
              </ul>
            </div>

            <div class="inspector-col">
              <h4><i class="fa-solid fa-bolt"></i> Illumination & RF Communications</h4>
              <ul class="dossier-list">
                <li><strong>Sunlight Availability:</strong> ${site.sunlightAvailability}% of lunar synodic year</li>
                <li><strong>Peak Solar Window:</strong> ${site.peakSunlightPeriod}</li>
                <li><strong>Max Shadow Window:</strong> ${site.maxShadowDuration}</li>
                <li><strong>Direct-To-Earth (DTE) LOS:</strong> ${site.earthVisibility}% libration visibility</li>
                <li><strong>Earth Elevation Range:</strong> ${site.earthElevationMin}° to +${site.earthElevationMax}°</li>
                <li><strong>Permanently Shadowed Region (PSR):</strong> ${site.psrProximityKm} km distance</li>
                <li><strong>Scientific Value Index:</strong> ${site.scientificValue} / 100</li>
              </ul>
            </div>
          </div>

          <div class="inspector-tradeoffs">
            <div class="tradeoff-box pros">
              <h5><i class="fa-solid fa-thumbs-up"></i> Mission Advantages</h5>
              <ul>
                ${site.advantages.map(adv => `<li>${adv}</li>`).join('')}
              </ul>
            </div>
            <div class="tradeoff-box cons">
              <h5><i class="fa-solid fa-triangle-exclamation"></i> Mission Challenges & Hazards</h5>
              <ul>
                ${site.challenges.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="inspector-recommendation">
            <i class="fa-solid fa-rocket rec-icon"></i>
            <div>
              <strong>Recommended Mission Application:</strong>
              <p>${site.recommendedMissionType}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button id="modal-select-and-fly" class="btn-hud-primary"><i class="fa-solid fa-crosshairs"></i> Select Target & Orbit in 3D</button>
          <button id="modal-compare-btn" class="btn-hud-secondary"><i class="fa-solid fa-scale-balanced"></i> Add to Comparison Dashboard</button>
          <a href="https://quickmap.lroc.im-ldi.com/?prjExtent=-6165547.0826951%2C-3751377.7422001%2C5834452.9173049%2C2088622.2577999&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="btn-hud-secondary glow-gold">
            <i class="fa-solid fa-satellite-dish"></i> Open in LROC QuickMap GIS
          </a>
        </div>
      </div>
    `;

    modal.classList.add('visible');

    // Close logic
    const closeBtn = document.getElementById('modal-close-btn');
    closeBtn.addEventListener('click', () => {
      audioSystem.playClick();
      modal.classList.remove('visible');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('visible');
      }
    });

    // Select and fly button
    const selectFlyBtn = document.getElementById('modal-select-and-fly');
    selectFlyBtn.addEventListener('click', () => {
      this.selectSite(siteId);
      modal.classList.remove('visible');
      // Switch to 3D Explorer tab
      const tabBtn = document.querySelector('[data-tab="explorer"]');
      if (tabBtn) tabBtn.click();
    });

    // Compare button
    const compareBtn = document.getElementById('modal-compare-btn');
    compareBtn.addEventListener('click', () => {
      audioSystem.playClick();
      modal.classList.remove('visible');
      const tabBtn = document.querySelector('[data-tab="comparison"]');
      if (tabBtn) tabBtn.click();
    });
  }
}
