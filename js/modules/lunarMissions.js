/**
 * LUNAR NAV — Lunar Missions & Exploration Module
 * Canadian Space Agency (CSA) & Global Lunar Exploration Research Hub
 * 
 * Features:
 * - Searchable & filterable Lunar Missions Database (26+ missions)
 * - Interactive Chronological Timeline (1959 to 2030+)
 * - Dedicated Canadian Space Agency Exploration Hub (Canadarm3, Jeremy Hansen, Canadian Lunar Rover, LEAP)
 * - NASA Artemis Programme & Lunar Gateway Architecture
 * - Lunar Technologies Matrix (Robotics, Rovers, TRN Navigation, Comms, Landing, Life Support, ISRU)
 * - Future Exploration Roadmap & Milestone Schedule
 * - Side-by-Side Mission Comparison Tool
 * - Interactive Mission Dossier Inspector Modals
 */

import {
  CSA_EXPLORATION_DATA,
  LUNAR_MISSIONS_DATABASE,
  LUNAR_TIMELINE_ERAS,
  LUNAR_TECHNOLOGIES_CATALOG,
  FUTURE_ROADMAP_MILESTONES
} from '../data/lunarMissionsData.js';
import { audioSystem } from './audioEffects.js';

export class LunarMissionsModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`LunarMissionsModule: Container #${containerId} not found.`);
      return;
    }

    this.activeSubTab = 'csa'; // Default to Canadian Space Agency showcase
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.agencyFilter = 'all';
    this.typeFilter = 'all';
    this.selectedEra = 'all';
    this.comparedMissionIds = [];
    this.activeDossierMission = null;

    this.init();
  }

  init() {
    this.renderShell();
    this.bindEvents();
    this.renderSubTab(this.activeSubTab);
  }

  renderShell() {
    this.container.innerHTML = `
      <div class="missions-module-container">
        <!-- Hero Header -->
        <div class="missions-hero-banner glass-panel">
          <div class="hero-top-meta">
            <span class="hud-tag"><i class="fa-solid fa-flag"></i> CANADIAN SPACE AGENCY & GLOBAL PARTNERS</span>
            <span class="missions-live-indicator">
              <span class="status-indicator-dot"></span>
              <span>GATEWAY & ARTEMIS COLLABORATION ACTIVE</span>
            </span>
          </div>

          <div class="missions-hero-main">
            <div class="hero-text-block">
              <h2 class="missions-main-title">LUNAR MISSIONS & EXPLORATION</h2>
              <div class="missions-tagline">Canadian Innovations, Historical Milestones & The Artemis Future</div>
              <p class="missions-lead-desc">
                An authoritative lunar research platform spotlighting the <strong>Canadian Space Agency's</strong> pivotal contributions to NASA's Artemis program—from the AI-driven <strong>Canadarm3</strong> and astronaut <strong>Jeremy Hansen</strong> on Artemis II to the <strong>Canadian Lunar Rover</strong>—alongside a comprehensive database of historic, active, and planned lunar missions.
              </p>
            </div>
            <div class="hero-csa-badge-card">
              <div class="csa-badge-header">
                <i class="fa-solid fa-map-location-dot gold"></i>
                <span>OFFICIAL PORTAL</span>
              </div>
              <h4>Canadian Space Agency</h4>
              <p>Explore Canada's official Moon Exploration strategy and research publications.</p>
              <a href="https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn-hud-primary btn-sm csa-direct-link">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit asc-csa.gc.ca
              </a>
            </div>
          </div>

          <!-- Sub-Navigation Navigation Bar -->
          <div class="missions-subnav-bar">
            <button class="missions-subnav-btn active" data-subtab="csa">
              <i class="fa-solid fa-flag"></i> <span>Canadian Contributions</span>
            </button>
            <button class="missions-subnav-btn" data-subtab="database">
              <i class="fa-solid fa-database"></i> <span>Missions Database</span>
            </button>
            <button class="missions-subnav-btn" data-subtab="timeline">
              <i class="fa-solid fa-timeline"></i> <span>Exploration Timeline</span>
            </button>
            <button class="missions-subnav-btn" data-subtab="artemis">
              <i class="fa-solid fa-shuttle-space"></i> <span>Artemis & Gateway</span>
            </button>
            <button class="missions-subnav-btn" data-subtab="technologies">
              <i class="fa-solid fa-microchip"></i> <span>Lunar Technologies</span>
            </button>
            <button class="missions-subnav-btn" data-subtab="roadmap">
              <i class="fa-solid fa-route"></i> <span>Future Roadmap</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Sub-Tab Content Viewport -->
        <div id="missions-viewport" class="missions-viewport"></div>

        <!-- Mission Comparison Floating Bar (Visible when 1 or 2 missions selected) -->
        <div id="missions-comparison-bar" class="missions-comparison-bar glass-panel" style="display: none;">
          <div class="comp-bar-left">
            <i class="fa-solid fa-scale-balanced cyan"></i>
            <span id="comp-bar-text">Select 2 missions to compare side by side</span>
          </div>
          <div class="comp-bar-actions">
            <button id="btn-trigger-compare" class="btn-hud-primary btn-sm" disabled>
              <i class="fa-solid fa-arrows-split-up-and-left"></i> Compare Missions
            </button>
            <button id="btn-clear-compare" class="btn-hud-ghost btn-sm">
              <i class="fa-solid fa-xmark"></i> Clear
            </button>
          </div>
        </div>

        <!-- Mission Detail Dossier Modal -->
        <div id="mission-dossier-modal" class="modal-backdrop">
          <div class="modal-dialog glass-panel" id="mission-modal-body"></div>
        </div>

        <!-- Side-by-Side Comparison Modal -->
        <div id="mission-comparison-modal" class="modal-backdrop">
          <div class="modal-dialog glass-panel comparison-modal-dialog" id="comparison-modal-body"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Sub-tab button clicks
    this.container.querySelectorAll('.missions-subnav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-subtab');
        if (target === this.activeSubTab) return;
        audioSystem.playClick();
        this.container.querySelectorAll('.missions-subnav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSubTab = target;
        this.renderSubTab(target);
      });
    });

    // Comparison Bar Trigger
    const triggerBtn = this.container.querySelector('#btn-trigger-compare');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        if (this.comparedMissionIds.length === 2) {
          audioSystem.playClick();
          this.openComparisonModal();
        }
      });
    }

    // Comparison Bar Clear
    const clearBtn = this.container.querySelector('#btn-clear-compare');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.comparedMissionIds = [];
        this.updateComparisonBar();
        this.renderSubTab(this.activeSubTab);
      });
    }

    // Modal Close Backdrop
    const dossierModal = this.container.querySelector('#mission-dossier-modal');
    if (dossierModal) {
      dossierModal.addEventListener('click', (e) => {
        if (e.target === dossierModal) {
          dossierModal.classList.remove('visible');
        }
      });
    }

    const compModal = this.container.querySelector('#mission-comparison-modal');
    if (compModal) {
      compModal.addEventListener('click', (e) => {
        if (e.target === compModal) {
          compModal.classList.remove('visible');
        }
      });
    }
  }

  renderSubTab(tab) {
    const viewport = this.container.querySelector('#missions-viewport');
    if (!viewport) return;

    switch (tab) {
      case 'csa':
        this.renderCsaSection(viewport);
        break;
      case 'database':
        this.renderDatabaseSection(viewport);
        break;
      case 'timeline':
        this.renderTimelineSection(viewport);
        break;
      case 'artemis':
        this.renderArtemisSection(viewport);
        break;
      case 'technologies':
        this.renderTechnologiesSection(viewport);
        break;
      case 'roadmap':
        this.renderRoadmapSection(viewport);
        break;
      default:
        this.renderCsaSection(viewport);
    }
  }

  /* =========================================================================
     1. CANADIAN SPACE AGENCY (CSA) SHOWCASE
     ========================================================================= */
  renderCsaSection(viewport) {
    const csa = CSA_EXPLORATION_DATA;
    viewport.innerHTML = `
      <div class="csa-showcase-view animate-fadeIn">
        <!-- Overview Banner -->
        <div class="csa-intro-card glass-panel">
          <div class="csa-intro-header">
            <div class="csa-brand-tag">
              <i class="fa-solid fa-leaf red"></i>
              <span>CANADIAN SPACE AGENCY &bull; LUNAR PORTFOLIO</span>
            </div>
            <a href="${csa.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn-hud-ghost btn-sm">
              <i class="fa-solid fa-globe"></i> CSA Moon Exploration Portal <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
          <h3>${csa.tagline}</h3>
          <p class="csa-body-text">${csa.overview}</p>
          <div class="csa-key-metrics">
            <div class="csa-metric-pill">
              <span class="m-val cyan">Canadarm3</span>
              <span class="m-lbl">Gateway AI Robotics</span>
            </div>
            <div class="csa-metric-pill">
              <span class="m-val green">Artemis II</span>
              <span class="m-lbl">Astronaut Jeremy Hansen</span>
            </div>
            <div class="csa-metric-pill">
              <span class="m-val gold">South Pole</span>
              <span class="m-lbl">Canadian Lunar Rover</span>
            </div>
            <div class="csa-metric-pill">
              <span class="m-val purple">$150M+ CAD</span>
              <span class="m-lbl">LEAP Accelerator Program</span>
            </div>
          </div>
        </div>

        <!-- Pillar Cards Grid -->
        <div class="csa-pillars-grid">
          ${csa.pillars.map(pillar => `
            <div class="csa-pillar-card glass-panel" id="pillar-${pillar.id}">
              <div class="pillar-card-header">
                <div class="pillar-icon-box">
                  <i class="fa-solid ${pillar.icon}"></i>
                </div>
                <div class="pillar-title-block">
                  <span class="hud-tag">${pillar.tag}</span>
                  <h4>${pillar.title}</h4>
                  <span class="pillar-subtitle">${pillar.subtitle}</span>
                </div>
              </div>

              <div class="pillar-stats-strip">
                ${pillar.stats.map(s => `
                  <div class="pillar-stat-box">
                    <span class="lbl">${s.label}</span>
                    <span class="val">${s.value}</span>
                  </div>
                `).join('')}
              </div>

              <p class="pillar-desc">${pillar.description}</p>

              ${pillar.capabilities ? `
                <div class="pillar-capabilities-box">
                  <h5><i class="fa-solid fa-gear cyan"></i> Core Capabilities:</h5>
                  <ul>
                    ${pillar.capabilities.map(c => `<li><i class="fa-solid fa-circle-check green"></i> ${c}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${pillar.astronauts ? `
                <div class="csa-astronauts-row">
                  ${pillar.astronauts.map(a => `
                    <div class="astronaut-card">
                      <div class="astro-header">
                        <div class="astro-badge"><i class="fa-solid fa-user-astronaut"></i></div>
                        <div>
                          <h5>${a.name}</h5>
                          <span class="astro-role">${a.role}</span>
                        </div>
                      </div>
                      <p class="astro-bio">${a.bio}</p>
                      <blockquote class="astro-quote">"${a.quote}"</blockquote>
                      <div class="astro-training">
                        <strong>Field Training:</strong> ${a.training}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${pillar.payloads ? `
                <div class="pillar-payloads-block">
                  <h5><i class="fa-solid fa-microscope gold"></i> Scientific Payload Suite (6 Instruments):</h5>
                  <div class="payloads-grid">
                    ${pillar.payloads.map(p => `
                      <div class="payload-chip">
                        <strong>${p.name}</strong>
                        <span>${p.role}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <div class="pillar-card-footer">
                <a href="${pillar.officialLink}" target="_blank" rel="noopener noreferrer" class="btn-hud-primary btn-sm">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Learn More at CSA
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* =========================================================================
     2. LUNAR MISSIONS DATABASE (SEARCH & FILTER)
     ========================================================================= */
  renderDatabaseSection(viewport) {
    const filteredMissions = this.getFilteredMissions();

    viewport.innerHTML = `
      <div class="missions-database-view animate-fadeIn">
        <!-- Control Bar: Search & Filters -->
        <div class="database-controls-bar glass-panel">
          <div class="db-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="mission-search-input" placeholder="Search by mission name, agency, target or keyword..." value="${this.searchQuery}">
            ${this.searchQuery ? `<button id="btn-clear-search" class="btn-clear"><i class="fa-solid fa-xmark"></i></button>` : ''}
          </div>

          <div class="db-filters-row">
            <div class="filter-group">
              <label><i class="fa-solid fa-circle-dot"></i> Status:</label>
              <select id="filter-status" class="hud-select">
                <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="Active" ${this.statusFilter === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Planned" ${this.statusFilter === 'Planned' ? 'selected' : ''}>Planned / Upcoming</option>
                <option value="Completed" ${this.statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>

            <div class="filter-group">
              <label><i class="fa-solid fa-building"></i> Agency:</label>
              <select id="filter-agency" class="hud-select">
                <option value="all" ${this.agencyFilter === 'all' ? 'selected' : ''}>All Agencies</option>
                <option value="CSA" ${this.agencyFilter === 'CSA' ? 'selected' : ''}>CSA (Canada)</option>
                <option value="NASA" ${this.agencyFilter === 'NASA' ? 'selected' : ''}>NASA (USA)</option>
                <option value="ISRO" ${this.agencyFilter === 'ISRO' ? 'selected' : ''}>ISRO (India)</option>
                <option value="JAXA" ${this.agencyFilter === 'JAXA' ? 'selected' : ''}>JAXA (Japan)</option>
                <option value="CNSA" ${this.agencyFilter === 'CNSA' ? 'selected' : ''}>CNSA (China)</option>
                <option value="ESA" ${this.agencyFilter === 'ESA' ? 'selected' : ''}>ESA (Europe)</option>
              </select>
            </div>

            <div class="filter-group">
              <label><i class="fa-solid fa-rocket"></i> Type:</label>
              <select id="filter-type" class="hud-select">
                <option value="all" ${this.typeFilter === 'all' ? 'selected' : ''}>All Types</option>
                <option value="Crewed" ${this.typeFilter === 'Crewed' ? 'selected' : ''}>Crewed Flights</option>
                <option value="Rover" ${this.typeFilter === 'Rover' ? 'selected' : ''}>Surface Rovers</option>
                <option value="Lander" ${this.typeFilter === 'Lander' ? 'selected' : ''}>Landers</option>
                <option value="Orbiter" ${this.typeFilter === 'Orbiter' ? 'selected' : ''}>Orbiters & Stations</option>
                <option value="Sample" ${this.typeFilter === 'Sample' ? 'selected' : ''}>Sample Returns</option>
              </select>
            </div>
          </div>

          <div class="db-status-bar">
            <span class="db-count-tag">Showing <strong>${filteredMissions.length}</strong> of ${LUNAR_MISSIONS_DATABASE.length} Lunar Missions</span>
            ${this.comparedMissionIds.length > 0 ? `
              <span class="comp-status-hint"><i class="fa-solid fa-check-double cyan"></i> ${this.comparedMissionIds.length}/2 selected for comparison</span>
            ` : ''}
          </div>
        </div>

        <!-- Mission Cards Grid -->
        ${filteredMissions.length === 0 ? `
          <div class="no-results-card glass-panel">
            <i class="fa-solid fa-circle-exclamation gold"></i>
            <h4>No Lunar Missions Found</h4>
            <p>No missions match your current search and filter criteria. Try resetting filters.</p>
            <button id="btn-reset-filters" class="btn-hud-secondary btn-sm">Reset All Filters</button>
          </div>
        ` : `
          <div class="missions-cards-grid">
            ${filteredMissions.map(m => {
              const isCompared = this.comparedMissionIds.includes(m.id);
              return `
                <div class="mission-card glass-panel ${isCompared ? 'selected-compare' : ''}" data-mission-id="${m.id}">
                  <div class="mission-card-top">
                    <div class="agency-badge-pill">${m.agency}</div>
                    <span class="status-pill status-${m.status.toLowerCase()}">${m.status}</span>
                  </div>

                  <h3 class="mission-card-name">${m.name}</h3>
                  <div class="mission-type-tag"><i class="fa-solid fa-satellite"></i> ${m.type}</div>

                  <div class="mission-meta-strip">
                    <div class="meta-item">
                      <span class="lbl">LAUNCH</span>
                      <span class="val">${m.launchDate}</span>
                    </div>
                    <div class="meta-item">
                      <span class="lbl">DESTINATION</span>
                      <span class="val">${m.destination}</span>
                    </div>
                  </div>

                  <p class="mission-summary-snippet">${m.summary}</p>

                  <div class="mission-tech-tags">
                    ${m.technologies.slice(0, 3).map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    ${m.technologies.length > 3 ? `<span class="tech-tag more">+${m.technologies.length - 3}</span>` : ''}
                  </div>

                  ${m.csaInvolvement ? `
                    <div class="csa-involvement-banner">
                      <i class="fa-solid fa-leaf red"></i>
                      <span>${m.csaInvolvement}</span>
                    </div>
                  ` : ''}

                  <div class="mission-card-actions">
                    <button class="btn-hud-primary btn-sm btn-inspect-mission" data-mission-id="${m.id}">
                      <i class="fa-solid fa-file-contract"></i> Dossier
                    </button>
                    <button class="btn-hud-secondary btn-sm btn-toggle-compare ${isCompared ? 'active' : ''}" data-mission-id="${m.id}">
                      <i class="fa-solid ${isCompared ? 'fa-check' : 'fa-scale-balanced'}"></i> ${isCompared ? 'Selected' : 'Compare'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    this.bindDatabaseEvents();
  }

  bindDatabaseEvents() {
    const searchInput = this.container.querySelector('#mission-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderDatabaseSection(this.container.querySelector('#missions-viewport'));
      });
    }

    const clearSearch = this.container.querySelector('#btn-clear-search');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        this.renderDatabaseSection(this.container.querySelector('#missions-viewport'));
      });
    }

    const filterStatus = this.container.querySelector('#filter-status');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.renderDatabaseSection(this.container.querySelector('#missions-viewport'));
      });
    }

    const filterAgency = this.container.querySelector('#filter-agency');
    if (filterAgency) {
      filterAgency.addEventListener('change', (e) => {
        this.agencyFilter = e.target.value;
        this.renderDatabaseSection(this.container.querySelector('#missions-viewport'));
      });
    }

    const filterType = this.container.querySelector('#filter-type');
    if (filterType) {
      filterType.addEventListener('change', (e) => {
        this.typeFilter = e.target.value;
        this.renderDatabaseSection(this.container.querySelector('#missions-viewport'));
      });
    }

    const resetBtn = this.container.querySelector('#btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.statusFilter = 'all';
        this.agencyFilter = 'all';
        this.typeFilter = 'all';
        this.renderDatabaseSection(this.container.querySelector('#missions-viewport'));
      });
    }

    // Inspect Mission Buttons
    this.container.querySelectorAll('.btn-inspect-mission').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-mission-id');
        this.openDossierModal(id);
      });
    });

    // Compare Toggle Buttons
    this.container.querySelectorAll('.btn-toggle-compare').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-mission-id');
        this.toggleMissionComparison(id);
      });
    });
  }

  getFilteredMissions() {
    return LUNAR_MISSIONS_DATABASE.filter(m => {
      // Search query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesAgency = m.agency.toLowerCase().includes(q);
        const matchesDest = m.destination.toLowerCase().includes(q);
        const matchesSummary = m.summary.toLowerCase().includes(q);
        const matchesTech = m.technologies.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesAgency && !matchesDest && !matchesSummary && !matchesTech) {
          return false;
        }
      }

      // Status filter
      if (this.statusFilter !== 'all') {
        if (m.status !== this.statusFilter) return false;
      }

      // Agency filter
      if (this.agencyFilter !== 'all') {
        if (!m.agency.includes(this.agencyFilter)) return false;
      }

      // Type filter
      if (this.typeFilter !== 'all') {
        if (!m.type.toLowerCase().includes(this.typeFilter.toLowerCase())) return false;
      }

      return true;
    });
  }

  toggleMissionComparison(id) {
    audioSystem.playClick();
    if (this.comparedMissionIds.includes(id)) {
      this.comparedMissionIds = this.comparedMissionIds.filter(mId => mId !== id);
    } else {
      if (this.comparedMissionIds.length >= 2) {
        this.comparedMissionIds.shift(); // Remove oldest
      }
      this.comparedMissionIds.push(id);
    }
    this.updateComparisonBar();
    this.renderDatabaseSection(this.container.querySelector('#missions-viewport'));
  }

  updateComparisonBar() {
    const bar = this.container.querySelector('#missions-comparison-bar');
    const text = this.container.querySelector('#comp-bar-text');
    const triggerBtn = this.container.querySelector('#btn-trigger-compare');
    if (!bar) return;

    if (this.comparedMissionIds.length === 0) {
      bar.style.display = 'none';
    } else {
      bar.style.display = 'flex';
      const missionNames = this.comparedMissionIds.map(id => {
        const m = LUNAR_MISSIONS_DATABASE.find(item => item.id === id);
        return m ? m.name : id;
      });

      if (this.comparedMissionIds.length === 1) {
        text.innerHTML = `<strong>${missionNames[0]}</strong> selected. Select 1 more mission to compare.`;
        if (triggerBtn) triggerBtn.disabled = true;
      } else {
        text.innerHTML = `Comparing: <strong>${missionNames[0]}</strong> vs <strong>${missionNames[1]}</strong>`;
        if (triggerBtn) triggerBtn.disabled = false;
      }
    }
  }

  /* =========================================================================
     3. EXPLORATION TIMELINE SECTION
     ========================================================================= */
  renderTimelineSection(viewport) {
    const eras = LUNAR_TIMELINE_ERAS;
    const activeEras = this.selectedEra === 'all' ? eras : eras.filter(e => e.id === this.selectedEra);

    viewport.innerHTML = `
      <div class="timeline-view animate-fadeIn">
        <div class="timeline-header-card glass-panel">
          <div class="timeline-title-wrap">
            <span class="hud-tag"><i class="fa-solid fa-clock-rotate-left"></i> CHRONOLOGY</span>
            <h3>Interactive Lunar Exploration Timeline</h3>
            <p>Trace the historic trajectory of lunar exploration across seven decades: from the early space race and Apollo human missions, to polar orbital mapping, the modern robotic renaissance, and the multi-national Artemis return.</p>
          </div>

          <div class="era-selector-pills">
            <button class="era-pill ${this.selectedEra === 'all' ? 'active' : ''}" data-era="all">All Eras</button>
            ${eras.map(e => `
              <button class="era-pill ${this.selectedEra === e.id ? 'active' : ''}" data-era="${e.id}">
                ${e.name} (${e.period})
              </button>
            `).join('')}
          </div>
        </div>

        <div class="eras-container">
          ${activeEras.map(era => `
            <div class="era-block">
              <div class="era-banner">
                <span class="era-badge">${era.badge}</span>
                <h4>${era.name} <span class="era-period">(${era.period})</span></h4>
                <p class="era-desc">${era.description}</p>
              </div>

              <div class="timeline-milestones-track">
                ${era.milestones.map(m => `
                  <div class="milestone-item">
                    <div class="milestone-year-bubble">${m.year}</div>
                    <div class="milestone-card glass-panel">
                      <div class="m-mission-name">${m.mission}</div>
                      <div class="m-event-text">${m.event}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind Era filter pills
    viewport.querySelectorAll('.era-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        audioSystem.playClick();
        this.selectedEra = btn.getAttribute('data-era');
        this.renderTimelineSection(viewport);
      });
    });
  }

  /* =========================================================================
     4. ARTEMIS PROGRAMME & LUNAR GATEWAY
     ========================================================================= */
  renderArtemisSection(viewport) {
    viewport.innerHTML = `
      <div class="artemis-architecture-view animate-fadeIn">
        <!-- Hero Overview -->
        <div class="artemis-hero-card glass-panel">
          <div class="artemis-top-meta">
            <span class="hud-tag"><i class="fa-solid fa-shuttle-space"></i> DEEP SPACE ARCHITECTURE</span>
            <span class="artemis-partners-badge">NASA &bull; CSA &bull; ESA &bull; JAXA</span>
          </div>
          <h3>NASA Artemis Programme & Lunar Gateway</h3>
          <p class="artemis-desc">
            The Artemis programme is humanity's sustainable return to the Moon. Unlike Apollo's short stays, Artemis establishes permanent cislunar infrastructure: the <strong>Lunar Gateway</strong> orbital outpost, regular crewed surface expeditions to the resource-rich <strong>lunar South Pole</strong>, and the commercial lunar payload ecosystem.
          </p>
        </div>

        <!-- Artemis Missions Breakdown -->
        <div class="artemis-flight-stages">
          <div class="section-heading-wrap">
            <span class="hud-tag">FLIGHT CAMPAIGN</span>
            <h4>Artemis Mission Flight Sequence</h4>
          </div>

          <div class="stages-grid">
            <div class="stage-card glass-panel status-completed">
              <div class="stage-header">
                <span class="stage-num">ARTEMIS I</span>
                <span class="badge-safe">COMPLETED (2022)</span>
              </div>
              <h5>Uncrewed Integrated Flight Test</h5>
              <p>Inaugural test flight of the Space Launch System (SLS) and uncrewed Orion. Traveled into Distant Retrograde Orbit (DRO) around the Moon and verified high-speed Mach 32 re-entry.</p>
              <div class="stage-stats">
                <span><strong>Duration:</strong> 25.5 Days</span>
                <span><strong>Distance:</strong> 2.25M km</span>
              </div>
            </div>

            <div class="stage-card glass-panel status-active border-accent">
              <div class="stage-header">
                <span class="stage-num cyan">ARTEMIS II</span>
                <span class="badge-caution">SCHEDULED 2025/2026</span>
              </div>
              <h5>Crewed Circumlunar Test (with Canada)</h5>
              <p>First crewed lunar mission in over 50 years. Four astronauts—including Canadian astronaut <strong>Col. Jeremy Hansen</strong>—will fly around the Moon in a hybrid free-return trajectory.</p>
              <div class="stage-stats">
                <span><strong>Crew:</strong> 4 Astronauts (1 CAN)</span>
                <span><strong>Trajectory:</strong> Free Return (10,300 km past Moon)</span>
              </div>
            </div>

            <div class="stage-card glass-panel status-planned">
              <div class="stage-header">
                <span class="stage-num gold">ARTEMIS III</span>
                <span class="badge-caution">PLANNED 2026/2027</span>
              </div>
              <h5>First Crewed South Pole Landing</h5>
              <p>Two astronauts will land on the lunar South Pole aboard SpaceX Starship HLS, conducting multiple moonwalks inside permanently shadowed cold traps to sample water ice.</p>
              <div class="stage-stats">
                <span><strong>Surface Crew:</strong> 2 Moonwalkers</span>
                <span><strong>Landing Area:</strong> South Pole (84°S-90°S)</span>
              </div>
            </div>

            <div class="stage-card glass-panel status-planned">
              <div class="stage-header">
                <span class="stage-num">ARTEMIS IV</span>
                <span class="badge-info">PLANNED 2028</span>
              </div>
              <h5>Gateway Assembly & I-Hab Delivery</h5>
              <p>Astronauts will travel to the Lunar Gateway, deliver the European International Habitat (I-Hab), and conduct the second human landing at the South Pole.</p>
              <div class="stage-stats">
                <span><strong>Outpost:</strong> Gateway NRHO</span>
                <span><strong>Robotics:</strong> Canadarm3 Operations</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lunar Gateway Architecture -->
        <div class="gateway-architecture-section glass-panel">
          <div class="gateway-header">
            <div>
              <span class="hud-tag"><i class="fa-solid fa-satellite"></i> ORBITAL OUTPOST</span>
              <h4>Lunar Gateway Modules & International Contributions</h4>
            </div>
            <span class="orbit-tag"><i class="fa-solid fa-route"></i> Orbit: Near-Rectilinear Halo Orbit (NRHO)</span>
          </div>

          <div class="gateway-modules-grid">
            <div class="gw-module-card">
              <span class="mod-agency">NASA / Maxar</span>
              <h5>Power & Propulsion Element (PPE)</h5>
              <p>50-kilowatt solar electric propulsion (SEP) module providing station power, attitude control, and high-speed cislunar communication relays.</p>
            </div>

            <div class="gw-module-card">
              <span class="mod-agency">NASA / Northrop Grumman</span>
              <h5>HALO (Habitation & Logistics Outpost)</h5>
              <p>Initial pressurized living quarters for visiting astronaut crews, outfitted with environmental control, avionics, and docking ports.</p>
            </div>

            <div class="gw-module-card highlight-csa">
              <span class="mod-agency csa-color"><i class="fa-solid fa-leaf red"></i> CSA (Canada) / MDA Space</span>
              <h5>Canadarm3 Smart Robotics System</h5>
              <p>8.5m Large Arm, Small Dexterous Arm, and autonomous AI operating system maintaining Gateway exterior, capturing visiting spacecraft, and servicing external science.</p>
            </div>

            <div class="gw-module-card">
              <span class="mod-agency">ESA (Europe) / Thales Alenia</span>
              <h5>I-Hab (International Habitat)</h5>
              <p>Full-scale environmental habitat module providing crew quarters, life support systems, and international scientific research laboratories.</p>
            </div>

            <div class="gw-module-card">
              <span class="mod-agency">ESA (Europe)</span>
              <h5>ESPRIT Refueling Module</h5>
              <p>European System Providing Refueling, Infrastructure and Telecommunications module for xenon, propellant, and high-rate lunar surface comms.</p>
            </div>

            <div class="gw-module-card">
              <span class="mod-agency">MBRSC (UAE) / JAXA</span>
              <h5>Crew and Science Airlock</h5>
              <p>Dedicated airlock module supporting astronaut spacewalks and deployment of external deep-space scientific payloads into the cislunar environment.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
     5. LUNAR TECHNOLOGIES MATRIX
     ========================================================================= */
  renderTechnologiesSection(viewport) {
    const techs = LUNAR_TECHNOLOGIES_CATALOG;
    viewport.innerHTML = `
      <div class="technologies-view animate-fadeIn">
        <div class="tech-header-card glass-panel">
          <span class="hud-tag"><i class="fa-solid fa-microchip"></i> ENGINEERING & SUBSYSTEMS</span>
          <h3>Lunar Exploration Technologies Matrix</h3>
          <p>The Moon presents one of the most hostile operating environments known to aerospace engineering: extreme thermal fluctuations, razor-sharp abrasive regolith, deep cryogenic shadow, and complete absence of GPS. Explore the core technological pillars enabling robotic and human lunar exploration.</p>
        </div>

        <div class="tech-cards-grid">
          ${techs.map(t => `
            <div class="tech-card glass-panel">
              <div class="tech-card-header">
                <div class="tech-icon-wrap">
                  <i class="fa-solid ${t.icon}"></i>
                </div>
                <div>
                  <h4>${t.title}</h4>
                  <span class="lead-example"><i class="fa-solid fa-bolt cyan"></i> Lead System: <strong>${t.leadExample}</strong></span>
                </div>
              </div>

              <p class="tech-overview">${t.overview}</p>

              <div class="tech-specs-box">
                ${t.specs.map(s => `
                  <div class="spec-row">
                    <span class="s-label">${s.label}:</span>
                    <span class="s-val">${s.value}</span>
                  </div>
                `).join('')}
              </div>

              <div class="tech-apps">
                <strong><i class="fa-solid fa-bullseye gold"></i> Applications:</strong> ${t.applications}
              </div>

              <div class="tech-csa-note">
                <i class="fa-solid fa-leaf red"></i>
                <div>
                  <strong>Canadian Leadership:</strong>
                  <span>${t.csaHighlight}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* =========================================================================
     6. FUTURE ROADMAP & UPCOMING MISSIONS
     ========================================================================= */
  renderRoadmapSection(viewport) {
    const milestones = FUTURE_ROADMAP_MILESTONES;
    viewport.innerHTML = `
      <div class="roadmap-view animate-fadeIn">
        <div class="roadmap-header-card glass-panel">
          <span class="hud-tag"><i class="fa-solid fa-forward"></i> STRATEGIC HORIZON</span>
          <h3>Future Lunar Exploration Roadmap (2025–2030+)</h3>
          <p>A verified, forward-looking roadmap of international lunar missions, permanent infrastructure deployments, and in-situ resource extraction milestones.</p>
        </div>

        <div class="roadmap-table-card glass-panel">
          <div class="table-responsive">
            <table class="hud-matrix-table">
              <thead>
                <tr>
                  <th>Target Timeline</th>
                  <th>Mission & Payload</th>
                  <th>Leading Agencies</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Strategic Significance</th>
                </tr>
              </thead>
              <tbody>
                ${milestones.map(m => `
                  <tr>
                    <td><strong class="cyan font-mono">${m.targetYear}</strong></td>
                    <td><strong>${m.mission}</strong></td>
                    <td><span class="agency-tag">${m.agency}</span></td>
                    <td><span class="category-tag">${m.category}</span></td>
                    <td><span class="status-pill status-${m.statusBadge.toLowerCase().replace(/\s+/g, '-')}">${m.statusBadge}</span></td>
                    <td class="roadmap-desc-cell">${m.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="strategic-priorities-grid">
          <div class="priority-card glass-panel">
            <div class="p-icon"><i class="fa-solid fa-icicles cyan"></i></div>
            <h4>Polar Volatiles & Water Mining</h4>
            <p>Permanently shadowed craters at the South Pole harbor estimated billions of metric tons of water ice. Extracting water provides breathing oxygen, drinking supplies, and liquid hydrogen/oxygen rocket propellant.</p>
          </div>

          <div class="priority-card glass-panel">
            <div class="p-icon"><i class="fa-solid fa-house-chimney-window gold"></i></div>
            <h4>Permanent Artemis Base Camp</h4>
            <p>Long-duration lunar surface habitats featuring unpressurized and pressurized rovers capable of sustaining 4 astronauts for up to 60 days on the lunar surface.</p>
          </div>

          <div class="priority-card glass-panel">
            <div class="p-icon"><i class="fa-solid fa-industry green"></i></div>
            <h4>Cislunar Industrial Economy</h4>
            <p>Commercial lunar payload logistics, orbital propellant depots, private landers, and continuous international science laboratories preparing humanity for Mars.</p>
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
     MODALS: MISSION DOSSIER & SIDE-BY-SIDE COMPARISON
     ========================================================================= */
  openDossierModal(missionId) {
    audioSystem.playClick();
    const mission = LUNAR_MISSIONS_DATABASE.find(m => m.id === missionId);
    if (!mission) return;

    const modal = this.container.querySelector('#mission-dossier-modal');
    const body = this.container.querySelector('#mission-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="hud-tag">${mission.agency} &bull; ${mission.country}</span>
          <h2>${mission.name}</h2>
          <span class="artemis-subtitle">${mission.type} &bull; Status: <strong class="green">${mission.status}</strong></span>
        </div>
        <button class="btn-close" id="btn-close-dossier"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="dossier-modal-content">
        <div class="dossier-specs-grid">
          <div class="spec-cell">
            <span class="lbl">LAUNCH DATE</span>
            <span class="val font-mono">${mission.launchDate}</span>
          </div>
          <div class="spec-cell">
            <span class="lbl">LAUNCH VEHICLE</span>
            <span class="val font-mono">${mission.vehicle}</span>
          </div>
          <div class="spec-cell">
            <span class="lbl">DESTINATION</span>
            <span class="val font-mono">${mission.destination}</span>
          </div>
          <div class="spec-cell">
            <span class="lbl">MISSION STATUS</span>
            <span class="val font-mono">${mission.status}</span>
          </div>
        </div>

        <div class="dossier-section-block">
          <h4><i class="fa-solid fa-bullseye cyan"></i> Mission Summary</h4>
          <p class="modal-body-p">${mission.summary}</p>
        </div>

        ${mission.crew ? `
          <div class="dossier-section-block">
            <h4><i class="fa-solid fa-user-astronaut gold"></i> Flight Crew</h4>
            <ul class="crew-list">
              ${mission.crew.map(c => `<li><i class="fa-solid fa-check green"></i> ${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="dossier-section-block">
          <h4><i class="fa-solid fa-list-check cyan"></i> Key Mission Objectives</h4>
          <ul class="objectives-list">
            ${mission.keyObjectives.map(obj => `<li><i class="fa-solid fa-arrow-right-long cyan"></i> ${obj}</li>`).join('')}
          </ul>
        </div>

        <div class="dossier-section-block">
          <h4><i class="fa-solid fa-microchip purple"></i> Core Technologies Employed</h4>
          <div class="dossier-tech-tags">
            ${mission.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div class="dossier-section-block">
          <h4><i class="fa-solid fa-award gold"></i> Key Discoveries & Scientific Legacy</h4>
          <p class="modal-body-p">${mission.discoveries}</p>
        </div>

        ${mission.csaInvolvement ? `
          <div class="dossier-csa-callout">
            <i class="fa-solid fa-leaf red"></i>
            <div>
              <strong>Canadian Space Agency Involvement:</strong>
              <p>${mission.csaInvolvement}</p>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="modal-footer">
        ${mission.officialUrl ? `
          <a href="${mission.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn-hud-primary">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Official Mission Source
          </a>
        ` : ''}
        <button class="btn-hud-secondary" id="btn-close-dossier-2">Close Dossier</button>
      </div>
    `;

    modal.classList.add('visible');

    const closeBtn = body.querySelector('#btn-close-dossier');
    const closeBtn2 = body.querySelector('#btn-close-dossier-2');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
    if (closeBtn2) closeBtn2.addEventListener('click', () => modal.classList.remove('visible'));
  }

  openComparisonModal() {
    if (this.comparedMissionIds.length !== 2) return;
    const m1 = LUNAR_MISSIONS_DATABASE.find(m => m.id === this.comparedMissionIds[0]);
    const m2 = LUNAR_MISSIONS_DATABASE.find(m => m.id === this.comparedMissionIds[1]);
    if (!m1 || !m2) return;

    const modal = this.container.querySelector('#mission-comparison-modal');
    const body = this.container.querySelector('#comparison-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="hud-tag"><i class="fa-solid fa-scale-balanced"></i> SIDE-BY-SIDE MISSION COMPARISON</span>
          <h2>${m1.name} <span class="cyan">vs</span> ${m2.name}</h2>
          <span class="artemis-subtitle">${m1.agency} vs ${m2.agency}</span>
        </div>
        <button class="btn-close" id="btn-close-comp"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="comparison-table-wrapper">
        <table class="hud-matrix-table comp-matrix-table">
          <thead>
            <tr>
              <th style="width: 20%;">Specification</th>
              <th style="width: 40%; color: var(--accent-blue);">${m1.name}</th>
              <th style="width: 40%; color: var(--status-amber);">${m2.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Space Agency</strong></td>
              <td>${m1.agency} (${m1.country})</td>
              <td>${m2.agency} (${m2.country})</td>
            </tr>
            <tr>
              <td><strong>Mission Type</strong></td>
              <td><span class="tech-tag">${m1.type}</span></td>
              <td><span class="tech-tag">${m2.type}</span></td>
            </tr>
            <tr>
              <td><strong>Mission Status</strong></td>
              <td><span class="status-pill status-${m1.status.toLowerCase()}">${m1.status}</span></td>
              <td><span class="status-pill status-${m2.status.toLowerCase()}">${m2.status}</span></td>
            </tr>
            <tr>
              <td><strong>Launch Date</strong></td>
              <td class="font-mono">${m1.launchDate}</td>
              <td class="font-mono">${m2.launchDate}</td>
            </tr>
            <tr>
              <td><strong>Launch Vehicle</strong></td>
              <td class="font-mono">${m1.vehicle}</td>
              <td class="font-mono">${m2.vehicle}</td>
            </tr>
            <tr>
              <td><strong>Destination</strong></td>
              <td>${m1.destination}</td>
              <td>${m2.destination}</td>
            </tr>
            <tr>
              <td><strong>Core Technologies</strong></td>
              <td>${m1.technologies.join(', ')}</td>
              <td>${m2.technologies.join(', ')}</td>
            </tr>
            <tr>
              <td><strong>Key Discoveries</strong></td>
              <td>${m1.discoveries}</td>
              <td>${m2.discoveries}</td>
            </tr>
            <tr>
              <td><strong>Canadian Space Agency Involvement</strong></td>
              <td>${m1.csaInvolvement || 'None / Indirect science collaboration'}</td>
              <td>${m2.csaInvolvement || 'None / Indirect science collaboration'}</td>
            </tr>
            <tr>
              <td><strong>Official Source</strong></td>
              <td><a href="${m1.officialUrl}" target="_blank" rel="noopener noreferrer" class="cyan">Official Link <i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
              <td><a href="${m2.officialUrl}" target="_blank" rel="noopener noreferrer" class="gold">Official Link <i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-footer">
        <button class="btn-hud-secondary" id="btn-close-comp-2">Close Comparison</button>
      </div>
    `;

    modal.classList.add('visible');

    const closeBtn = body.querySelector('#btn-close-comp');
    const closeBtn2 = body.querySelector('#btn-close-comp-2');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
    if (closeBtn2) closeBtn2.addEventListener('click', () => modal.classList.remove('visible'));
  }
}
