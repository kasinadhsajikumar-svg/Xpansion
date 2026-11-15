/**
 * LUNAR NAV — Main Application Orchestrator
 * Coordinates state across 3D Explorer, Site Catalog, Comparison Dashboard,
 * Sunlight Simulator, Earth Comm Telemetry, Safety Analyzer, and Dossier Generator.
 */

import { LUNAR_LANDING_SITES, MISSION_STATUS } from './data/lunarSites.js';
import { audioSystem } from './modules/audioEffects.js';
import { Moon3DExplorer } from './modules/moon3d.js';
import { LunarTerrainExplorerModule } from './modules/lunarTerrainExplorer.js';
import { SiteSelectionModule } from './modules/siteSelection.js';
import { SiteComparisonModule } from './modules/comparison.js';
import { SunlightAnalysisModule } from './modules/sunlightAnalysis.js';
import { EarthCommAnalysisModule } from './modules/earthCommAnalysis.js';
import { LandingSafetyAnalyzerModule } from './modules/safetyAnalyzer.js';
import { SolarPowerAnalyzerModule } from './modules/solarPowerAnalyzer.js';
import { MissionDatePlannerModule } from './modules/missionDatePlanner.js';
import { LunarMissionsModule } from './modules/lunarMissions.js';
import { MissionReportModule } from './modules/missionReport.js';
class LunarNavApp {
  constructor() {
    this.selectedSite = LUNAR_LANDING_SITES.find(s => s.id === 'site-002') || LUNAR_LANDING_SITES[0]; // Default: Malapert Mountain
    this.activeTab = 'home';
    this.moonExplorer = null;
    this.terrainExplorerModule = null;
    this.siteCatalog = null;
    this.comparisonModule = null;
    this.sunlightModule = null;
    this.earthCommModule = null;
    this.safetyModule = null;
    this.solarPowerModule = null;
    this.missionPlannerModule = null;
    this.missionsModule = null;
    this.reportModule = null;

    this.metSeconds = 142850; // Initial simulated mission elapsed time
    this.init();
  }

  init() {
    // 1. Initialize Clocks & Telemetry
    this.startMissionClocks();

    // 2. Setup Navigation Tab Listeners
    this.setupNavigation();

    // 3. Audio & Global Controls
    this.setupGlobalControls();

    // 4. Initialize 3D Moon Explorer
    this.init3DExplorer();

    // 5. Populate Home Dashboard Telemetry Cards
    this.updateHomeDashboard();

    // 6. Setup Responsive Mobile Navigation
    this.setupMobileMenu();
  }

  startMissionClocks() {
    const utcClock = document.getElementById('hud-utc-clock');
    const metClock = document.getElementById('hud-met-clock');

    const updateClocks = () => {
      const now = new Date();
      if (utcClock) {
        utcClock.textContent = now.toUTCString().replace('GMT', 'UTC');
      }

      this.metSeconds++;
      if (metClock) {
        const d = Math.floor(this.metSeconds / 86400);
        const h = Math.floor((this.metSeconds % 86400) / 3600);
        const m = Math.floor((this.metSeconds % 3600) / 60);
        const s = this.metSeconds % 60;
        metClock.textContent = `MET: ${String(d).padStart(3, '0')}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      }
    };

    updateClocks();
    setInterval(updateClocks, 1000);
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('[data-tab]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // "Start Navigation" Hero Button
    const heroStartBtn = document.getElementById('hero-start-btn');
    if (heroStartBtn) {
      heroStartBtn.addEventListener('click', () => {
        this.switchTab('explorer');
      });
    }

    // Quick access card buttons on home
    document.querySelectorAll('[data-quick-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-quick-tab');
        const modeHint = btn.getAttribute('data-mode-hint');
        this.switchTab(tab);
        if (tab === 'explorer' && modeHint) {
          this.setExplorerMode(modeHint);
        }
      });
    });
  }

  switchTab(tabId) {
    if (this.activeTab === tabId) return;
    this.activeTab = tabId;
    audioSystem.playClick();

    // Update active class on nav buttons
    document.querySelectorAll('[data-tab]').forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
    });

    // Hide all tab views and show target
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Lazy initialization of heavy modules when their tab is first opened
    this.onTabOpened(tabId);
  }

  onTabOpened(tabId) {
    if (tabId === 'explorer') {
      if (this.moonExplorer) {
        setTimeout(() => this.moonExplorer.onWindowResize(), 50);
      }
    } else if (tabId === 'moontrek') {
      if (!this.terrainExplorerModule) {
        this.terrainExplorerModule = new LunarTerrainExplorerModule('moontrek-module-root', (loc) => this.onObserverLocationChanged(loc));
        this.terrainExplorerModule.setLocation(this.selectedSite);
      } else {
        this.terrainExplorerModule.setLocation(this.selectedSite);
      }
    } else if (tabId === 'sites') {
      if (!this.siteCatalog) {
        this.siteCatalog = new SiteSelectionModule('sites-module-root', (site) => this.onSiteSelected(site));
        this.siteCatalog.setSelectedSite(this.selectedSite.id);
      }
    } else if (tabId === 'comparison') {
      if (!this.comparisonModule) {
        this.comparisonModule = new SiteComparisonModule('comparison-module-root', (site) => this.onSiteSelected(site));
      } else {
        this.comparisonModule.updateCalculations();
      }
    } else if (tabId === 'sunlight') {
      if (!this.sunlightModule) {
        this.sunlightModule = new SunlightAnalysisModule('sunlight-module-root', this.selectedSite.id);
      } else {
        this.sunlightModule.setSite(this.selectedSite);
      }
    } else if (tabId === 'comm') {
      if (!this.earthCommModule) {
        this.earthCommModule = new EarthCommAnalysisModule('comm-module-root', this.selectedSite.id);
      } else {
        this.earthCommModule.setSite(this.selectedSite);
      }
    } else if (tabId === 'safety') {
      if (!this.safetyModule) {
        this.safetyModule = new LandingSafetyAnalyzerModule('safety-module-root', this.selectedSite.id);
      } else {
        this.safetyModule.setSite(this.selectedSite);
      }
    } else if (tabId === 'solar') {
      if (!this.solarPowerModule) {
        this.solarPowerModule = new SolarPowerAnalyzerModule('solar-module-root', this.selectedSite.id);
      } else {
        this.solarPowerModule.setSite(this.selectedSite);
      }
    } else if (tabId === 'planner') {
      if (!this.missionPlannerModule) {
        this.missionPlannerModule = new MissionDatePlannerModule('planner-module-root', this.selectedSite.id);
      } else {
        this.missionPlannerModule.setSite(this.selectedSite);
      }
    } else if (tabId === 'missions') {
      if (!this.missionsModule) {
        this.missionsModule = new LunarMissionsModule('missions-module-root');
      }
    } else if (tabId === 'report') {
      if (!this.reportModule) {
        this.reportModule = new MissionReportModule('report-module-root', this.selectedSite.id);
      } else {
        this.reportModule.setSite(this.selectedSite);
      }
    }
  }

  init3DExplorer() {
    try {
      this.moonExplorer = new Moon3DExplorer('moon-canvas-container', (site) => this.onSiteSelected(site));
      this.moonExplorer.selectSite(this.selectedSite.id, false);

      // Layer buttons
      const layerBtns = document.querySelectorAll('[data-layer]');
      layerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          layerBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const layer = btn.getAttribute('data-layer');
          if (this.moonExplorer) {
            this.moonExplorer.setSurfaceLayer(layer);
          }
        });
      });

      // Camera preset buttons
      const camBtns = document.querySelectorAll('[data-cam-preset]');
      camBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          camBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const preset = btn.getAttribute('data-cam-preset');
          if (this.moonExplorer) {
            this.moonExplorer.setCameraPreset(preset);
          }
        });
      });

      // Sun angle control in 3D Explorer
      const sunSlider = document.getElementById('explorer-sun-slider');
      if (sunSlider) {
        sunSlider.addEventListener('input', (e) => {
          const angle = parseFloat(e.target.value);
          if (this.moonExplorer) {
            this.moonExplorer.updateSunPosition(angle);
          }
          const valEl = document.getElementById('explorer-sun-val');
          if (valEl) valEl.textContent = `${angle}°`;
        });
      }

      // Earth Shadow simulation toggle (QuickMap earthShadowEnabled=true)
      const earthShadowBtn = document.getElementById('explorer-earth-shadow-btn');
      if (earthShadowBtn) {
        earthShadowBtn.addEventListener('click', () => {
          if (this.moonExplorer) {
            const nextState = !this.moonExplorer.earthShadowEnabled;
            this.moonExplorer.setEarthShadow(nextState);
            earthShadowBtn.classList.toggle('active', nextState);
            earthShadowBtn.innerHTML = nextState 
              ? '<i class="fa-solid fa-earth-americas cyan"></i> Earth Shadow: ON' 
              : '<i class="fa-solid fa-earth-americas silver"></i> Earth Shadow: OFF';
          }
        });
      }

      // Explorer Viewport Mode Switcher (3D Moon Globe vs LROC QuickMap GIS vs Split)
      const modeBtns = document.querySelectorAll('[data-explorer-mode]');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-explorer-mode');
          this.setExplorerMode(mode);
        });
      });
    } catch (err) {
      console.error("Three.js Explorer initialization error:", err);
    }
  }

  setExplorerMode(mode) {
    this.explorerMode = mode;
    audioSystem.playModeSwitch();

    const modeBtns = document.querySelectorAll('[data-explorer-mode]');
    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-explorer-mode') === mode);
    });

    const workspace = document.getElementById('explorer-dual-workspace');
    const moonPane = document.getElementById('moon-canvas-container');
    const qmPane = document.getElementById('quickmap-viewport');
    const hudLayer = document.getElementById('explorer-hud-layer');

    if (workspace && moonPane && qmPane) {
      workspace.className = `explorer-workspace mode-${mode}`;

      if (mode === '3d') {
        moonPane.style.display = 'block';
        moonPane.style.width = '100%';
        qmPane.style.display = 'none';
        if (hudLayer) hudLayer.style.display = 'flex';
      } else if (mode === 'quickmap') {
        moonPane.style.display = 'none';
        qmPane.style.display = 'flex';
        qmPane.style.width = '100%';
        if (hudLayer) hudLayer.style.display = 'none';
      } else if (mode === 'split') {
        moonPane.style.display = 'block';
        moonPane.style.width = '50%';
        qmPane.style.display = 'flex';
        qmPane.style.width = '50%';
        if (hudLayer) hudLayer.style.display = 'flex';
      }

      setTimeout(() => {
        if (this.moonExplorer) this.moonExplorer.onWindowResize();
      }, 50);
    }
  }

  onSiteSelected(site) {
    this.selectedSite = site;
    this.updateSelectedSiteHUD();

    // Propagate to open modules
    if (this.terrainExplorerModule) this.terrainExplorerModule.setLocation(site);
    if (this.siteCatalog) this.siteCatalog.setSelectedSite(site.id);
    if (this.sunlightModule) this.sunlightModule.setSite(site);
    if (this.earthCommModule) this.earthCommModule.setSite(site);
    if (this.safetyModule) this.safetyModule.setSite(site);
    if (this.reportModule) this.reportModule.setSite(site);
  }

  onObserverLocationChanged(location) {
    // Synthesize site object from the custom observer location
    const synthSite = {
      id: location.siteId || `custom-${Date.now()}`,
      name: location.name,
      scientificDesignation: location.isCustom ? "OBSERVER-CUSTOM-POS" : (this.selectedSite.scientificDesignation || "LOLA-OBSERVER"),
      artemisCandidateRegion: location.isCustom ? "Custom Exploration Coordinates" : (this.selectedSite.artemisCandidateRegion || "Lunar Surface Observer"),
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: location.elevation,
      slope: location.slope || 5.0,
      slopeDistribution: this.selectedSite.slopeDistribution || { flat: 75, moderate: 20, steep: 5 },
      craterDensity: "Evaluated Observer Horizon",
      surfaceHazards: this.selectedSite.surfaceHazards || {
        boulderAbundance: "Moderate",
        roughnessHurst: 0.85,
        hazardLevel: "Low-Moderate",
        riskScore: 20
      },
      sunlightAvailability: location.isCustom ? 82.0 : this.selectedSite.sunlightAvailability,
      peakSunlightPeriod: "Evaluated based on latitude & horizon dip",
      maxShadowDuration: "Calculated via local horizon envelope",
      earthVisibility: location.isCustom ? 78.0 : this.selectedSite.earthVisibility,
      earthElevationMin: -2.0,
      earthElevationMax: 6.5,
      psrProximityKm: location.isCustom ? 3.0 : this.selectedSite.psrProximityKm,
      scientificValue: 90,
      overallSuitability: location.isCustom ? 88 : this.selectedSite.overallSuitability,
      terrainType: "Highland Surface Observer Point",
      geologicalAge: "Pre-Nectarian / Imbrian",
      landingEllipseKm: [2.0, 1.5],
      description: `Observer exploration location at ${location.latitude.toFixed(2)}° S, ${location.longitude.toFixed(2)}° E (+${location.elevation}m altitude). Horizon visibility calculations synchronized across NASA JPL Horizons ephemeris engine.`,
      advantages: [
        `Horizon dip bonus of +${(Math.sqrt((2 * Math.max(0, location.elevation)/1000) / 1737.4) * 180 / Math.PI).toFixed(2)}° extending line-of-sight`,
        "Real-time synchronized ephemeris and solar geometry tracking"
      ],
      challenges: [
        "Local micro-relief variations requires descent sensor confirmation"
      ],
      recommendedMissionType: "Surface Reconnaissance & Observer Station"
    };

    this.selectedSite = synthSite;
    this.updateSelectedSiteHUD();

    // Propagate to all modules
    if (this.siteCatalog && !location.isCustom) this.siteCatalog.setSelectedSite(synthSite.id);
    if (this.sunlightModule) this.sunlightModule.setSite(synthSite);
    if (this.earthCommModule) this.earthCommModule.setSite(synthSite);
    if (this.safetyModule) this.safetyModule.setSite(synthSite);
    if (this.reportModule) this.reportModule.setSite(synthSite);
    if (this.moonExplorer) this.moonExplorer.flyToCoordinates(synthSite.latitude, synthSite.longitude, 15);
  }

  updateSelectedSiteHUD() {
    const s = this.selectedSite;
    // Explorer Side HUD updates
    const titleEl = document.getElementById('hud-selected-name');
    const desigEl = document.getElementById('hud-selected-desig');
    const coordsEl = document.getElementById('hud-selected-coords');
    const elevEl = document.getElementById('hud-selected-elevation');
    const slopeEl = document.getElementById('hud-selected-slope');
    const scoreEl = document.getElementById('hud-selected-score');
    const sunEl = document.getElementById('hud-selected-sun');
    const earthEl = document.getElementById('hud-selected-earth');
    const psrEl = document.getElementById('hud-selected-psr');
    const descEl = document.getElementById('hud-selected-desc');

    if (titleEl) titleEl.textContent = s.name;
    if (desigEl) desigEl.textContent = `${s.scientificDesignation} • ${s.artemisCandidateRegion}`;
    if (coordsEl) coordsEl.textContent = `${s.latitude.toFixed(2)}° S, ${s.longitude.toFixed(2)}° E`;
    if (elevEl) elevEl.textContent = `+${s.elevation} m (LOLA)`;
    if (slopeEl) slopeEl.textContent = `${s.slope}° (avg)`;
    if (scoreEl) scoreEl.textContent = `${s.overallSuitability} / 100`;
    if (sunEl) sunEl.textContent = `${s.sunlightAvailability}%`;
    if (earthEl) earthEl.textContent = `${s.earthVisibility}%`;
    if (psrEl) psrEl.textContent = `${s.psrProximityKm} km`;
    if (descEl) descEl.textContent = s.description;

    this.updateHomeDashboard();
  }

  updateHomeDashboard() {
    const s = this.selectedSite;
    const homeSiteName = document.getElementById('home-target-name');
    const homeSiteCoords = document.getElementById('home-target-coords');
    const homeSiteScore = document.getElementById('home-target-score');
    const homeSiteSlope = document.getElementById('home-target-slope');
    const homeSiteSun = document.getElementById('home-target-sun');
    const homeSiteEarth = document.getElementById('home-target-earth');

    if (homeSiteName) homeSiteName.textContent = s.name;
    if (homeSiteCoords) homeSiteCoords.textContent = `${s.latitude.toFixed(2)}° S, ${s.longitude.toFixed(2)}° E (+${s.elevation}m)`;
    if (homeSiteScore) homeSiteScore.textContent = `${s.overallSuitability}%`;
    if (homeSiteSlope) homeSiteSlope.textContent = `${s.slope}°`;
    if (homeSiteSun) homeSiteSun.textContent = `${s.sunlightAvailability}%`;
    if (homeSiteEarth) homeSiteEarth.textContent = `${s.earthVisibility}%`;
  }

  setupGlobalControls() {
    // Audio Mute/Unmute Toggle
    const audioBtn = document.getElementById('audio-toggle-btn');
    const updateAudioIcon = (isMuted) => {
      if (audioBtn) {
        audioBtn.innerHTML = isMuted 
          ? '<i class="fa-solid fa-volume-xmark"></i> <span class="btn-lbl">MUTED</span>' 
          : '<i class="fa-solid fa-volume-high"></i> <span class="btn-lbl">AUDIO ON</span>';
        audioBtn.classList.toggle('muted', isMuted);
      }
    };

    updateAudioIcon(audioSystem.isMuted);

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = audioSystem.toggleMute();
        updateAudioIcon(isMuted);
        if (!isMuted) audioSystem.playClick();
      });
    }

    // First user click unlocks Web Audio context
    document.addEventListener('click', () => {
      audioSystem.init();
    }, { once: true });
  }

  setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('app-sidebar') || document.getElementById('main-nav-links');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        audioSystem.playClick();
        sidebar.classList.toggle('mobile-open');
        toggleBtn.classList.toggle('open');
      });

      // Close mobile menu on clicking any link
      sidebar.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          sidebar.classList.remove('mobile-open');
          toggleBtn.classList.remove('open');
        });
      });
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.lunarNavApp = new LunarNavApp();
});
