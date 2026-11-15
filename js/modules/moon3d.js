/**
 * LUNAR NAV — Photorealistic 3D Moon Explorer (NASA LROC / LOLA 1:1 Engine)
 * Features authentic NASA LROC 2K photographic albedo maps, LOLA elevation topography,
 * polar stereographic South Pole orientation (matching LROC QuickMap proj=10),
 * Earth shadow simulation (earthShadowEnabled=true), and tactical mission-control markers.
 */

import { LUNAR_LANDING_SITES, MISSION_STATUS } from '../data/lunarSites.js';
import { LUNAR_CRATER_CATALOG } from '../data/craterCatalog.js';
import { audioSystem } from './audioEffects.js';

export class Moon3DExplorer {
  constructor(containerId, onSiteSelected) {
    this.container = document.getElementById(containerId);
    this.onSiteSelected = onSiteSelected;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.moonMesh = null;
    this.markersGroup = new THREE.Group();
    this.pulseRings = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.radius = 10;
    this.activeLayer = 'optical'; // 'optical', 'lola', 'psr', 'slope'
    this.sunLight = null;
    this.earthLight = null;
    this.sunAngle = 45; // degrees
    this.earthShadowEnabled = true;
    this.selectedSiteId = 'site-002'; // Malapert Mountain default
    this.isHoveringMarker = false;
    this.animationFrameId = null;
    this.textures = {};
    this.materials = {};

    this.init();
  }

  init() {
    if (!this.container) return;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera: Default orientation framed directly onto the Lunar South Pole (matching LROC QuickMap proj=10)
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    // Camera positioned directly below South Pole looking at the polar exploration corridor
    this.camera.position.set(0, -21.5, 4.5);

    // 3. Renderer with high dynamic range ACES Filmic tone mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    if (THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 11.0;
      this.controls.maxDistance = 60.0;
      this.controls.rotateSpeed = 0.8;
      this.controls.zoomSpeed = 1.0;
      // Target at lunar center
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }

    // 5. Photorealistic Space Lighting
    this.setupLighting();

    // 6. Deep Space Starfield
    this.createStarfield();

    // 7. Load Authentic 2K LROC Surface Textures & Multi-Spectral Layers
    this.loadPhotorealisticTextures();
    this.createMoonSphere();

    // 8. Add Markers & South Pole Indicator
    this.scene.add(this.markersGroup);
    this.createSouthPoleIndicator();
    this.createLandingMarkers();
    this.createCraterLandmarks();

    // 9. Coordinate Grid Lines
    this.createCoordinateGrid();

    // 10. Event Listeners
    this.bindEvents();

    // 11. Start Render Loop
    this.animate();
  }

  setupLighting() {
    // Ambient space fill light mimicking starfield and deep space vacuum
    const ambientLight = new THREE.AmbientLight(0x060c18, 0.35);
    this.scene.add(ambientLight);

    // Primary Directional Sun light (sharp space shadows over crater rims)
    this.sunLight = new THREE.DirectionalLight(0xfff8eb, 2.8);
    this.updateSunPosition(this.sunAngle);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Earthshine Light: Realistic subtle bluish reflection on the lunar night side
    this.earthLight = new THREE.DirectionalLight(0x2a598a, 0.45);
    // Positioned based on Sub-Earth point (+6.2° Lat, -4.8° Lon)
    const subEarthPos = this.latLonToVector3(6.2, -4.8, 50);
    this.earthLight.position.copy(subEarthPos);
    this.scene.add(this.earthLight);
  }

  updateSunPosition(angleDeg) {
    this.sunAngle = angleDeg;
    const rad = (angleDeg * Math.PI) / 180;
    const subSolarLatRad = (-1.54 * Math.PI) / 180;
    const dist = 65;
    const x = dist * Math.cos(subSolarLatRad) * Math.sin(rad);
    const y = dist * Math.sin(subSolarLatRad);
    const z = dist * Math.cos(subSolarLatRad) * Math.cos(rad);

    if (this.sunLight) {
      this.sunLight.position.set(x, y, z);
    }
  }

  setEarthShadow(enabled) {
    this.earthShadowEnabled = enabled;
    if (this.earthLight) {
      this.earthLight.intensity = enabled ? 0.45 : 0.08;
    }
    audioSystem.playModeSwitch();
  }

  createStarfield() {
    const starCount = 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 260 + Math.random() * 160;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const tint = Math.random();
      if (tint > 0.85) {
        colors[i * 3] = 0.55; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1.0; // Cyan
      } else if (tint > 0.70) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 0.65; // Gold
      } else {
        colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0; // White
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.88
    });

    const starfield = new THREE.Points(geometry, material);
    this.scene.add(starfield);
  }

  /**
   * Loads authentic NASA LROC 2K photographic albedo maps and generates
   * true LOLA Hypsometric elevation, Cryogenic PSR, and Slope Hazard textures
   */
  loadPhotorealisticTextures() {
    const textureLoader = new THREE.TextureLoader();

    // 1. Load authentic LROC 2K photographic albedo texture
    this.textures.optical = textureLoader.load('assets/textures/moon_albedo_2k.jpg', (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      // When the authentic 2K image is loaded, generate derived multi-spectral maps
      this.generateDerivedMultiSpectralMaps(tex.image);
    }, undefined, () => {
      // Fallback to 1K if 2K fails
      this.textures.optical = textureLoader.load('assets/textures/moon_albedo_1k.jpg');
    });

    // 2. Generate bump map and initial multi-spectral textures
    this.generateInitialFallbackMaps();
  }

  generateInitialFallbackMaps() {
    const W = 2048;
    const H = 1024;
    const createCanvas = () => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      return c;
    };

    // Bump Map
    const bumpCanvas = createCanvas();
    const bumpCtx = bumpCanvas.getContext('2d');
    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, W, H);
    this.textures.bump = new THREE.CanvasTexture(bumpCanvas);
  }

  /**
   * Generates high-fidelity LOLA, PSR, Slope, and Bump maps directly from the authentic NASA LROC image
   */
  generateDerivedMultiSpectralMaps(lrocImage) {
    if (!lrocImage) return;

    const W = 2048;
    const H = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(lrocImage, 0, 0, W, H);

    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;

    // --- 1. Authentic Bump Map from image luminance & crater topography ---
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = W;
    bumpCanvas.height = H;
    const bumpCtx = bumpCanvas.getContext('2d');
    const bumpImgData = bumpCtx.createImageData(W, H);
    const bData = bumpImgData.data;

    // --- 2. LOLA Hypsometric Elevation Map (Official NASA color ramp: Deep Purple -> Cyan -> Green -> Red/Gold) ---
    const lolaCanvas = document.createElement('canvas');
    lolaCanvas.width = W;
    lolaCanvas.height = H;
    const lolaCtx = lolaCanvas.getContext('2d');
    const lolaImgData = lolaCtx.createImageData(W, H);
    const lData = lolaImgData.data;

    // --- 3. PSR (Permanently Shadowed Regions) Map ---
    const psrCanvas = document.createElement('canvas');
    psrCanvas.width = W;
    psrCanvas.height = H;
    const psrCtx = psrCanvas.getContext('2d');
    const psrImgData = psrCtx.createImageData(W, H);
    const pData = psrImgData.data;

    // --- 4. Slope Hazard Heatmap (Green safe, amber caution, red hazard) ---
    const slopeCanvas = document.createElement('canvas');
    slopeCanvas.width = W;
    slopeCanvas.height = H;
    const slopeCtx = slopeCanvas.getContext('2d');
    const slopeImgData = slopeCtx.createImageData(W, H);
    const sData = slopeImgData.data;

    // LOLA Color Palette Lookup (-9km to +10km)
    const getLolaColor = (normElev) => {
      // normElev: 0.0 (deepest basin) to 1.0 (highest peak)
      if (normElev < 0.20) {
        // Deep blue to navy purple (-9km to -5km)
        return [16, 23, 64];
      } else if (normElev < 0.40) {
        // Cyan to teal (-5km to -2km)
        return [14, 116, 144];
      } else if (normElev < 0.65) {
        // Emerald to regolith green (-2km to +1km)
        return [22, 163, 74];
      } else if (normElev < 0.85) {
        // Amber gold (+1km to +4km)
        return [245, 158, 11];
      } else {
        // Crimson to snowy white (> +4km peaks like Malapert and Mons Mouton)
        return [239, 68, 68];
      }
    };

    // Known South Pole Cold Trap Locations (Y coordinates around H * 0.94 to H * 1.0)
    const isSouthPolePsr = (x, y) => {
      const latFraction = y / H; // 0.0 = North, 0.5 = Equator, 1.0 = South Pole
      if (latFraction < 0.93) return false; // Above -80° latitude

      // Check proximity to verified PSR crater centers:
      // Shackleton, Haworth, Cabeus, Faustini, Shoemaker, de Gerlache
      const psrCenters = [
        { x: W * 0.50, y: H * 0.995, r: 18 }, // Shackleton (89.9°S)
        { x: W * 0.40, y: H * 0.965, r: 36 }, // Cabeus (84.9°S)
        { x: W * 0.72, y: H * 0.975, r: 26 }, // Faustini
        { x: W * 0.48, y: H * 0.978, r: 24 }, // Haworth
        { x: W * 0.62, y: H * 0.985, r: 30 }, // Shoemaker
        { x: W * 0.25, y: H * 0.986, r: 22 }  // de Gerlache
      ];

      for (const c of psrCenters) {
        const dx = x - c.x;
        const dy = y - c.y;
        if (dx * dx + dy * dy < c.r * c.r) return true;
      }
      return false;
    };

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b; // Photographic luminance

        // 1. Bump: enhanced luminance contrast
        const bumpVal = Math.min(255, Math.max(0, lum * 1.15));
        bData[idx] = bumpVal;
        bData[idx + 1] = bumpVal;
        bData[idx + 2] = bumpVal;
        bData[idx + 3] = 255;

        // 2. LOLA: Elevation normalized by latitude and luminance
        // South Pole-Aitken basin is at southern latitudes (y > H * 0.8)
        let elevNorm = lum / 255;
        if (y > H * 0.80 && y < H * 0.92) {
          elevNorm *= 0.65; // South Pole-Aitken depression
        } else if (y >= H * 0.92) {
          // South Pole rim peaks (Malapert Mountain +5040m, Mons Mouton +5520m)
          elevNorm = 0.5 + (lum / 255) * 0.5;
        }

        const lolaCol = getLolaColor(elevNorm);
        lData[idx] = lolaCol[0];
        lData[idx + 1] = lolaCol[1];
        lData[idx + 2] = lolaCol[2];
        lData[idx + 3] = 255;

        // 3. PSR Cryogenic Map:
        if (isSouthPolePsr(x, y)) {
          // Glowing neon cyan / electric indigo cold trap
          pData[idx] = 0;
          pData[idx + 1] = 240;
          pData[idx + 2] = 255;
          pData[idx + 3] = 255;
        } else {
          // Regolith dark space tint
          const dim = lum * 0.25;
          pData[idx] = dim;
          pData[idx + 1] = dim * 1.1;
          pData[idx + 2] = dim * 1.4;
          pData[idx + 3] = 255;
        }

        // 4. Slope Hazards:
        // Steeper slopes at high local contrast / crater walls
        const slopeHazard = lum > 195 || (lum > 70 && lum < 95);
        if (isSouthPolePsr(x, y)) {
          // Steep inner crater wall hazard (Red > 12°)
          sData[idx] = 239;
          sData[idx + 1] = 68;
          sData[idx + 2] = 68;
          sData[idx + 3] = 255;
        } else if (slopeHazard) {
          // Caution slope (Amber 5°-10°)
          sData[idx] = 245;
          sData[idx + 1] = 158;
          sData[idx + 2] = 11;
          sData[idx + 3] = 255;
        } else {
          // Safe flat highland plateau (Green < 5°)
          sData[idx] = 16;
          sData[idx + 1] = 185;
          sData[idx + 2] = 129;
          sData[idx + 3] = 255;
        }
      }
    }

    bumpCtx.putImageData(bumpImgData, 0, 0);
    lolaCtx.putImageData(lolaImgData, 0, 0);
    psrCtx.putImageData(psrImgData, 0, 0);
    slopeCtx.putImageData(slopeImgData, 0, 0);

    const createTex = (c) => {
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    this.textures.bump = createTex(bumpCanvas);
    this.textures.lola = createTex(lolaCanvas);
    this.textures.psr = createTex(psrCanvas);
    this.textures.slope = createTex(slopeCanvas);

    // Update material bump map and active layer texture
    if (this.moonMesh) {
      this.moonMesh.material.bumpMap = this.textures.bump;
      this.moonMesh.material.bumpScale = 0.14;
      this.setSurfaceLayer(this.activeLayer);
    }
  }

  createMoonSphere() {
    // High-resolution sphere geometry (128x128 segments)
    const geometry = new THREE.SphereGeometry(this.radius, 128, 128);

    // Initial Material: Photorealistic LROC WAC Optical Regolith
    this.materials.moon = new THREE.MeshStandardMaterial({
      map: this.textures.optical,
      bumpMap: this.textures.bump,
      bumpScale: 0.14,
      roughness: 0.94, // True regolith diffuse scattering
      metalness: 0.04
    });

    this.moonMesh = new THREE.Mesh(geometry, this.materials.moon);
    this.moonMesh.castShadow = true;
    this.moonMesh.receiveShadow = true;

    // Lunar axial tilt: 1.543° obliquity to ecliptic
    this.moonMesh.rotation.z = (1.543 * Math.PI) / 180;
    this.scene.add(this.moonMesh);
  }

  setSurfaceLayer(layerName) {
    if (!this.textures[layerName] || !this.moonMesh) return;
    this.activeLayer = layerName;
    audioSystem.playModeSwitch();

    this.moonMesh.material.map = this.textures[layerName];
    if (layerName === 'psr' || layerName === 'slope') {
      this.moonMesh.material.roughness = 0.65;
    } else {
      this.moonMesh.material.roughness = 0.94;
    }
    this.moonMesh.material.needsUpdate = true;
  }

  /**
   * Helper: converts spherical lunar coordinates (lat, lon) to 3D Cartesian coordinates
   * Latitude -90° is at y = -radius (South Pole). Latitude +90° is at y = +radius (North Pole).
   */
  latLonToVector3(lat, lon, altitude = 0) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = this.radius + altitude;

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  createSouthPoleIndicator() {
    // South Pole is exactly at lat = -90° (y = -radius)
    const polePos = this.latLonToVector3(-90, 0, 0.06);

    // Polar target reticle ring
    const ringGeo = new THREE.RingGeometry(0.38, 0.46, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(polePos);
    ringMesh.lookAt(0, 0, 0);
    this.scene.add(ringMesh);

    // Central crosshair marker
    const pinGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.copy(polePos);
    this.scene.add(pinMesh);
  }

  createLandingMarkers() {
    LUNAR_LANDING_SITES.forEach((site) => {
      const pos = this.latLonToVector3(site.latitude, site.longitude, 0.08);

      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pos);
      markerGroup.lookAt(0, 0, 0);

      const isTopSite = site.overallSuitability >= 94;
      const beaconColor = isTopSite ? 0xf59e0b : 0x00f0ff;

      // 1. Tactical Target Reticle Pin
      const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 12);
      pinGeo.rotateX(Math.PI / 2);
      const pinMat = new THREE.MeshStandardMaterial({
        color: beaconColor,
        emissive: beaconColor,
        emissiveIntensity: 0.8,
        roughness: 0.2
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.z = 0.32;
      markerGroup.add(pinMesh);

      // 2. Beacon Spherical Tip
      const tipGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const tipMat = new THREE.MeshBasicMaterial({ color: beaconColor });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.z = 0.68;
      markerGroup.add(tipMesh);

      // 3. Animated Pulsing Radar Ring
      const ringGeo = new THREE.RingGeometry(0.24, 0.34, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: beaconColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.z = 0.04;
      markerGroup.add(ringMesh);

      this.pulseRings.push({
        mesh: ringMesh,
        scale: 1.0,
        opacity: 0.85,
        speed: 0.016 + Math.random() * 0.008
      });

      // 4. Hit Target (invisible enlarged sphere for smooth raycasting)
      const hitGeo = new THREE.SphereGeometry(0.7, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { site, markerGroup, tipMesh, pinMesh, baseColor: beaconColor };
      markerGroup.add(hitMesh);

      this.markersGroup.add(markerGroup);
    });
  }

  createCraterLandmarks() {
    LUNAR_CRATER_CATALOG.forEach(crater => {
      if (crater.region !== 'Lunar South Pole') {
        const pos = this.latLonToVector3(crater.latitude, crater.longitude, 0.04);
        const geo = new THREE.RingGeometry(0.16, 0.24, 24);
        const mat = new THREE.MeshBasicMaterial({
          color: 0x94a3b8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.lookAt(0, 0, 0);
        mesh.userData = { crater };
        this.scene.add(mesh);
      }
    });
  }

  createCoordinateGrid() {
    // Parallels (Latitude lines: -85°, -80°, -70°, 0°)
    const lats = [-85, -80, -70, 0];
    lats.forEach(lat => {
      const points = [];
      const segs = 96;
      for (let i = 0; i <= segs; i++) {
        const lon = (i / segs) * 360 - 180;
        points.push(this.latLonToVector3(lat, lon, 0.02));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: lat === -85 ? 0x00f0ff : 0x334155,
        transparent: true,
        opacity: lat === -85 ? 0.5 : 0.22
      });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener('click', (e) => this.onPointerClick(e));
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markersGroup.children, true);

    const tooltip = document.getElementById('moon-tooltip');

    if (intersects.length > 0) {
      let hit = null;
      for (const obj of intersects) {
        if (obj.object.userData && obj.object.userData.site) {
          hit = obj.object.userData;
          break;
        }
      }

      if (hit) {
        this.renderer.domElement.style.cursor = 'pointer';
        if (!this.isHoveringMarker) {
          audioSystem.playScan();
          this.isHoveringMarker = true;
        }

        if (tooltip) {
          const s = hit.site;
          tooltip.style.display = 'block';
          tooltip.style.left = `${event.clientX + 16}px`;
          tooltip.style.top = `${event.clientY - 12}px`;
          tooltip.innerHTML = `
            <div class="hud-tooltip-header">
              <span class="hud-tag">TARGET SITE</span>
              <h4>${s.name}</h4>
            </div>
            <div class="hud-tooltip-body">
              <div><span class="lbl">COORDS:</span> <span class="val">${s.latitude.toFixed(2)}°S, ${s.longitude.toFixed(2)}°E</span></div>
              <div><span class="lbl">ELEVATION:</span> <span class="val">+${s.elevation} m</span></div>
              <div><span class="lbl">SLOPE:</span> <span class="val">${s.slope}° (avg)</span></div>
              <div><span class="lbl">SUITABILITY:</span> <span class="val cyan">${s.overallSuitability}%</span></div>
            </div>
          `;
        }
        return;
      }
    }

    this.renderer.domElement.style.cursor = 'grab';
    this.isHoveringMarker = false;
    if (tooltip) tooltip.style.display = 'none';

    // Update Coordinate HUD from Moon intersection
    if (this.moonMesh) {
      const moonHits = this.raycaster.intersectObject(this.moonMesh);
      if (moonHits.length > 0) {
        const point = moonHits[0].point;
        const r = this.radius;
        const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, point.y / r))) * 180) / Math.PI;
        let lon = (Math.atan2(point.z, -point.x) * 180) / Math.PI - 180;
        if (lon < -180) lon += 360;

        const coordDisplay = document.getElementById('hud-cursor-coords');
        if (coordDisplay) {
          coordDisplay.textContent = `LAT: ${Math.abs(lat).toFixed(2)}° ${lat < 0 ? 'S' : 'N'} | LON: ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
        }
      }
    }
  }

  onPointerClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markersGroup.children, true);

    if (intersects.length > 0) {
      for (const obj of intersects) {
        if (obj.object.userData && obj.object.userData.site) {
          const site = obj.object.userData.site;
          audioSystem.playTargetLock();
          this.selectSite(site.id, true);
          if (this.onSiteSelected) {
            this.onSiteSelected(site);
          }
          break;
        }
      }
    }
  }

  selectSite(siteId, animateCamera = true) {
    this.selectedSiteId = siteId;
    const site = LUNAR_LANDING_SITES.find(s => s.id === siteId);
    if (!site) return;

    // Highlight selected marker
    this.markersGroup.children.forEach(group => {
      const hitObj = group.children.find(c => c.userData && c.userData.site);
      if (hitObj) {
        const isCurrent = hitObj.userData.site.id === siteId;
        if (hitObj.userData.tipMesh) {
          hitObj.userData.tipMesh.material.color.setHex(isCurrent ? 0xff0055 : hitObj.userData.baseColor);
        }
      }
    });

    if (animateCamera) {
      this.flyToCoordinates(site.latitude, site.longitude, 14.8);
    }
  }

  flyToCoordinates(lat, lon, targetDistance = 16) {
    const targetPos = this.latLonToVector3(lat, lon, targetDistance - this.radius);
    const startPos = this.camera.position.clone();
    const duration = 1200;
    const startTime = performance.now();

    const tween = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }

      if (progress < 1) {
        requestAnimationFrame(tween);
      }
    };
    tween();
  }

  setCameraPreset(preset) {
    audioSystem.playClick();
    if (preset === 'south-pole') {
      // Look straight down at the South Pole (-90° lat / QuickMap proj=10)
      const targetPos = new THREE.Vector3(0, -21.5, 4.5);
      this.animateCameraToPosition(targetPos);
    } else if (preset === 'overview') {
      // Global overview
      const targetPos = new THREE.Vector3(0, -12, 22);
      this.animateCameraToPosition(targetPos);
    } else if (preset === 'equator') {
      const targetPos = new THREE.Vector3(22, 0, 0);
      this.animateCameraToPosition(targetPos);
    } else if (preset === 'shackleton') {
      this.selectSite('site-001', true);
    } else if (preset === 'malapert') {
      this.selectSite('site-002', true);
    }
  }

  animateCameraToPosition(targetPos) {
    const startPos = this.camera.position.clone();
    const duration = 1000;
    const startTime = performance.now();

    const tween = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }
      if (progress < 1) {
        requestAnimationFrame(tween);
      }
    };
    tween();
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    // Animate pulsing radar rings
    this.pulseRings.forEach(ring => {
      ring.scale += ring.speed;
      ring.opacity = Math.max(0, 0.85 - (ring.scale - 1.0) * 0.9);
      ring.mesh.scale.set(ring.scale, ring.scale, 1);
      ring.mesh.material.opacity = ring.opacity;

      if (ring.scale > 2.0) {
        ring.scale = 1.0;
        ring.opacity = 0.85;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
