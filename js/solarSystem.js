/* ============================================
   SOLAR SYSTEM - 3D Scene with Three.js
   ============================================ */

class SolarSystem {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.planets = {};
        this.planetMeshes = [];
        this.isDisposed = false;
        this.currentView = 'solar'; // solar, earth, journey, moon
        this.cameraDistance = 80;
        this.cameraAngleX = 0;
        this.cameraAngleY = 0.3;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.missionManager = null;

        this.init();
    }

    init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 30, 80);
        this.camera.lookAt(0, 0, 0);

        // Lighting
        this.setupLighting();

        // Create solar system
        this.createStarfield();
        this.createSun();
        this.createPlanets();
        this.createOrbits();

        // Events
        this.bindEvents();

        // Mission manager
        this.missionManager = new MissionManager(this);

        // Start animation
        this.animate();
    }

    setupLighting() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x222244, 0.3);
        this.scene.add(ambient);

        // Sun light (point light at center)
        this.sunLight = new THREE.PointLight(0xffdd88, 2, 500);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 500 + Math.random() * 1500;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            const brightness = 0.5 + Math.random() * 0.5;
            colors[i3] = brightness;
            colors[i3 + 1] = brightness;
            colors[i3 + 2] = brightness + Math.random() * 0.2;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.starfield = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.starfield);
    }

    createSun() {
        // Sun body - Yüksek detay
        const sunGeo = new THREE.SphereGeometry(5, 64, 64);
        const sunMat = new THREE.MeshStandardMaterial({
            color: 0xffdd00,
            emissive: 0xffaa00,
            emissiveIntensity: 2, 
            roughness: 1
        });
        this.sun = new THREE.Mesh(sunGeo, sunMat);
        this.sun.name = 'Güneş';
        this.scene.add(this.sun);

        // Core glow
        const glowGeo = new THREE.SphereGeometry(6.2, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        this.sun.add(new THREE.Mesh(glowGeo, glowMat));

        // Outer corona
        const outerGlowGeo = new THREE.SphereGeometry(8.5, 32, 32);
        const outerGlowMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        this.sun.add(new THREE.Mesh(outerGlowGeo, outerGlowMat));
    }

    createPlanets() {
        const planetData = [
            { name: 'Merkür', color: 0xb0b0b0, size: 0.6, distance: 10, speed: 4.15, tilt: 0.03 },
            { name: 'Venüs', color: 0xe8c06a, size: 0.9, distance: 14, speed: 1.62, tilt: 0.05 },
            { name: 'Dünya', color: 0x4488ff, size: 1, distance: 19, speed: 1.0, tilt: 0.41, hasAtmosphere: true },
            { name: 'Mars', color: 0xcc4422, size: 0.7, distance: 24, speed: 0.53, tilt: 0.44 },
            { name: 'Jüpiter', color: 0xcc9966, size: 2.5, distance: 34, speed: 0.084, tilt: 0.05 },
            { name: 'Satürn', color: 0xddcc88, size: 2, distance: 44, speed: 0.034, tilt: 0.47, hasRing: true },
            { name: 'Uranüs', color: 0x88ccdd, size: 1.5, distance: 53, speed: 0.012, tilt: 1.71 },
            { name: 'Neptün', color: 0x4466cc, size: 1.4, distance: 62, speed: 0.006, tilt: 0.49 }
        ];

        planetData.forEach(data => {
            const group = new THREE.Group();

            // Planet - Pürüzsüz görünüm için 64 segment
            const geo = new THREE.SphereGeometry(data.size, 64, 64);
            
            let isGasGiant = ['Jüpiter', 'Satürn', 'Uranüs', 'Neptün', 'Venüs'].includes(data.name);
            const mat = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: isGasGiant ? 0.3 : 0.9,
                metalness: isGasGiant ? 0.1 : 0.05,
            });

            // Add some surface detail to Earth
            if (data.name === 'Dünya') {
                const textureLoader = new THREE.TextureLoader();
                mat.map = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
                mat.color = new THREE.Color(0xffffff);
                mat.emissive = new THREE.Color(0x000000); 
            }

            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.name = data.name;
            mesh.userData = {
                planetName: data.name,
                distance: data.distance,
                speed: data.speed,
                angle: Math.random() * Math.PI * 2,
                isPlanet: true
            };

            group.add(mesh);

            // Atmosphere for Earth
            if (data.hasAtmosphere) {
                const atmosGeo = new THREE.SphereGeometry(data.size * 1.15, 64, 64);
                const atmosMat = new THREE.MeshBasicMaterial({
                    color: 0x4488ff,
                    transparent: true,
                    opacity: 0.15,
                    side: THREE.BackSide
                });
                const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
                mesh.add(atmosphere);

                // Cloud layer
                const cloudGeo = new THREE.SphereGeometry(data.size * 1.015, 64, 64);
                const textureLoader = new THREE.TextureLoader();
                const cloudMat = new THREE.MeshLambertMaterial({
                    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'),
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const clouds = new THREE.Mesh(cloudGeo, cloudMat);
                clouds.name = 'clouds';
                mesh.add(clouds);

                // Mission marker for Turkey area
                const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
                const markerMat = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000
                });
                const marker = new THREE.Mesh(markerGeo, markerMat);
                const lat = 39 * Math.PI / 180;
                const lon = 35 * Math.PI / 180;
                marker.position.set(
                    data.size * 1.2 * Math.cos(lat) * Math.cos(lon),
                    data.size * 1.2 * Math.sin(lat),
                    data.size * 1.2 * Math.cos(lat) * Math.sin(lon)
                );
                marker.name = 'turkeyMarker';
                mesh.add(marker);

                // Marker glow ring
                const ringGeo = new THREE.RingGeometry(0.2, 0.35, 32);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xff4444,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.copy(marker.position);
                ring.lookAt(0, 0, 0);
                ring.name = 'missionRing';
                mesh.add(ring);
            }

            // Saturn ring
            if (data.hasRing) {
                const ringGeo = new THREE.RingGeometry(data.size * 1.3, data.size * 2.2, 64);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xccbb88,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.5
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI / 2.5;
                mesh.add(ring);
            }

            // Moon for Earth
            if (data.name === 'Dünya') {
                const moonGeo = new THREE.SphereGeometry(0.12, 32, 32); 
                const textureLoader = new THREE.TextureLoader();
                const moonMat = new THREE.MeshStandardMaterial({
                    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'),
                    roughness: 1,
                    metalness: 0.1
                });
                
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.name = 'Ay';
                moon.userData = { isMoon: true, angle: 0, distance: 3.0, speed: 2 }; 
                group.add(moon);
                this.planets['Ay'] = { mesh: moon, group: group, data: { distance: 3.0 } };
            }

            this.scene.add(group);
            this.planets[data.name] = { mesh: mesh, group: group, data: data };
            this.planetMeshes.push(mesh);
        });
    }

    createOrbits() {
        const planetNames = ['Merkür', 'Venüs', 'Dünya', 'Mars', 'Jüpiter', 'Satürn', 'Uranüs', 'Neptün'];
        planetNames.forEach(name => {
            const planet = this.planets[name];
            if (!planet) return;

            const curve = new THREE.EllipseCurve(
                0, 0,
                planet.data.distance, planet.data.distance,
                0, 2 * Math.PI,
                false, 0
            );
            const points = curve.getPoints(128);
            const geometry = new THREE.BufferGeometry().setFromPoints(
                points.map(p => new THREE.Vector3(p.x, 0, p.y))
            );
            const material = new THREE.LineBasicMaterial({
                color: 0x333366,
                transparent: true,
                opacity: 0.3
            });
            const orbit = new THREE.Line(geometry, material);
            this.scene.add(orbit);
        });
    }

    bindEvents() {
        this.resizeHandler = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', this.resizeHandler);

        this.mouseDownHandler = (e) => {
            if (e.button === 1 || e.button === 2) {
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
            if (e.button === 0) {
                this.handleClick(e);
            }
        };
        this.canvas.addEventListener('mousedown', this.mouseDownHandler);

        this.mouseMoveHandler = (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                this.cameraAngleX -= deltaX * 0.005;
                this.cameraAngleY = Math.max(-1.2, Math.min(1.2, this.cameraAngleY - deltaY * 0.005));
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        };
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);

        this.mouseUpHandler = () => {
            this.isDragging = false;
        };
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);

        this.scrollHandler = (e) => {
            e.preventDefault();
            if (this.currentView === 'solar') {
                this.cameraDistance = Math.max(15, Math.min(200, this.cameraDistance + e.deltaY * 0.05));
            } else if (this.currentView === 'earth') {
                this.cameraDistance = Math.max(3, Math.min(30, this.cameraDistance + e.deltaY * 0.01));
            }
        };
        this.canvas.addEventListener('wheel', this.scrollHandler, { passive: false });
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        document.getElementById('closeHelpBtn').addEventListener('click', () => {
            document.getElementById('controlsHelp').style.display = 'none';
        });
    }

    handleClick(e) {
        if (this.currentView === 'journey' || this.currentView === 'moonExplore') return;

        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.planetMeshes, true);

        if (intersects.length > 0) {
            let clickedObj = intersects[0].object;

            while (clickedObj && !clickedObj.userData.isPlanet && clickedObj.parent) {
                clickedObj = clickedObj.parent;
            }

            if (clickedObj && clickedObj.userData.isPlanet) {
                const planetName = clickedObj.userData.planetName;

                if (planetName === 'Dünya') {
                    if (this.currentView === 'solar') {
                        this.focusOnEarth();
                    } else if (this.currentView === 'earth') {
                        this.missionManager.showMissionAlert();
                    }
                } else {
                    this.showLockedAlert(planetName);
                }
            }
        }
    }

    showLockedAlert(planetName) {
        const alert = document.getElementById('planetLockedAlert');
        document.getElementById('lockedPlanetName').textContent = `${planetName} gezegeni şu anda kilitli..`;
        alert.classList.remove('hidden');

        const closeBtn = document.getElementById('closeLockedAlert');
        const handler = () => {
            alert.classList.add('hidden');
            closeBtn.removeEventListener('click', handler);
        };
        closeBtn.addEventListener('click', handler);
    }

    focusOnEarth() {
        this.currentView = 'earth';
        this.cameraDistance = 5;
        document.getElementById('gameStatus').textContent = 'Dünya - Görev bölgesini bul!';

        setTimeout(() => {
            this.missionManager.showMissionAlert();
        }, 2000);
    }

    returnToSolarView() {
        this.currentView = 'solar';
        this.cameraDistance = 80;
        this.cameraAngleX = 0;
        this.cameraAngleY = 0.3;
        document.getElementById('gameStatus').textContent = 'Güneş Sistemi - Serbest Gezinti';

        document.querySelectorAll('.game-panel, .game-alert, .game-hud').forEach(el => {
            el.classList.add('hidden');
        });
        document.getElementById('crosshair').classList.add('hidden');
    }

    updatePlanetPositions(time) {
        Object.keys(this.planets).forEach(name => {
            const planet = this.planets[name];
            if (!planet.data || name === 'Ay') return;

            const mesh = planet.mesh;
            const data = mesh.userData;

            if (data.speed !== undefined) {
                data.angle += data.speed * 0.002;

                const x = data.distance * Math.cos(data.angle);
                const z = data.distance * Math.sin(data.angle);
                mesh.position.set(x, 0, z);

                mesh.rotation.y += 0.005;

                if (name === 'Dünya') {
                    const clouds = mesh.getObjectByName('clouds');
                    if (clouds) clouds.rotation.y += 0.002;

                    const ring = mesh.getObjectByName('missionRing');
                    if (ring) {
                        const scale = 1 + Math.sin(time * 3) * 0.3;
                        ring.scale.set(scale, scale, scale);
                        ring.material.opacity = 0.3 + Math.sin(time * 3) * 0.3;
                    }
                }
            }
        });

        const earth = this.planets['Dünya'];
        const moon = this.planets['Ay'];
        if (earth && moon) {
            const moonData = moon.mesh.userData;
            moonData.angle += moonData.speed * 0.002;
            const earthPos = earth.mesh.position;
            moon.mesh.position.set(
                earthPos.x + moonData.distance * Math.cos(moonData.angle),
                0,
                earthPos.z + moonData.distance * Math.sin(moonData.angle)
            );
        }
    }

    updateCamera() {
        if (this.currentView === 'solar') {
            const x = this.cameraDistance * Math.sin(this.cameraAngleX) * Math.cos(this.cameraAngleY);
            const y = this.cameraDistance * Math.sin(this.cameraAngleY);
            const z = this.cameraDistance * Math.cos(this.cameraAngleX) * Math.cos(this.cameraAngleY);
            this.camera.position.set(x, Math.max(5, y), z);
            this.camera.lookAt(0, 0, 0);
        } else if (this.currentView === 'earth') {
            const earthMesh = this.planets['Dünya'].mesh;
            const earthPos = earthMesh.position;
            const x = earthPos.x + this.cameraDistance * Math.sin(this.cameraAngleX) * Math.cos(this.cameraAngleY);
            const y = earthPos.y + this.cameraDistance * Math.sin(this.cameraAngleY);
            const z = earthPos.z + this.cameraDistance * Math.cos(this.cameraAngleX) * Math.cos(this.cameraAngleY);
            this.camera.position.set(x, Math.max(1, y), z);
            this.camera.lookAt(earthPos);
        }
    }

    animate() {
        if (this.isDisposed) return;

        const time = this.clock.getElapsedTime();

        this.updatePlanetPositions(time);

        if (this.currentView === 'solar' || this.currentView === 'earth') {
            this.updateCamera();
        }

        if (this.sun) {
            const scale = 1 + Math.sin(time * 2) * 0.02;
            this.sun.scale.set(scale, scale, scale);
        }

        if (this.starfield) {
            this.starfield.rotation.y += 0.0001;
        }

        if (this.missionManager) {
            this.missionManager.update(time);
        }

        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    reset() {
        this.returnToSolarView();
        document.getElementById('gameStatus').style.display = 'block';
    }

    dispose() {
        this.isDisposed = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);

        window.removeEventListener('resize', this.resizeHandler);
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
        this.canvas.removeEventListener('wheel', this.scrollHandler);

        if (this.missionManager) {
            this.missionManager.dispose();
        }

        this.scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        this.renderer.dispose();
    }
}