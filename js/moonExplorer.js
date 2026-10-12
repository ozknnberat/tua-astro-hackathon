// ============================================================
//  MOON EXPLORER — Realistik Ay Yüzeyi & Keşif Görevleri
// ============================================================
class MoonExplorer {
  constructor(solarSystem, onComplete) {
    this.ss = solarSystem;
    this.onComplete = onComplete;
    this.isActive = true;
    this.timeLeft = 60;
    this.timerInterval = null;

    // Player
    this.playerPos = new THREE.Vector3(0, 2, 0);
    this.playerVel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.keys = {};
    this.isJumping = false;
    this.headBobTimer = 0; 

    // Moon objects & Discovery
    this.moonObjects = [];
    this.discoveryPoints = [];
    this.discoveredCount = 0;
    this.totalDiscoveries = 8;
    this.activeLabel = null;

    // Footprints
    this.footprints = [];
    this.footprintTimer = 0;
    this.lastFootprintPos = new THREE.Vector3();

    this.init();
  }

  init() {
    this.hideSolarSystem();

    this.createMoonLighting();
    this.createMoonTerrain();
    this.createCraters();
    this.createRocks();
    this.createLandingModule();
    this.createTurkishFlag();
    this.createEarthInSky();
    this.createSunInSky();
    this.createDiscoveryPoints(); // Keşif noktaları geri geldi
    this.createDustParticles();
    this.createHUD();             // Arayüz geri geldi

    this.bindControls();
    this.startTimer();
    this.ss.canvas.requestPointerLock();
  }

  hideSolarSystem() {
    if (this.ss.sun) this.ss.sun.visible = false;
    if (this.ss.starfield) this.ss.starfield.visible = false;
    Object.values(this.ss.planets).forEach(p => {
      if (p.mesh) p.mesh.visible = false;
      if (p.group) p.group.visible = false;
    });
    this.ss.scene.traverse(child => {
      if (child.isLine) child.visible = false; 
    });
  }

  showSolarSystem() {
    if (this.ss.sun) this.ss.sun.visible = true;
    if (this.ss.starfield) this.ss.starfield.visible = true;
    Object.values(this.ss.planets).forEach(p => {
      if (p.mesh) p.mesh.visible = true;
      if (p.group) p.group.visible = true;
    });
    this.ss.scene.traverse(child => {
      if (child.isLine) child.visible = true;
    });
  }

  createMoonLighting() {
    this.mainLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    this.mainLight.position.set(100, 80, -60);
    this.mainLight.castShadow = true;
    this.mainLight.shadow.mapSize.width = 2048;
    this.mainLight.shadow.mapSize.height = 2048;
    this.mainLight.shadow.camera.near = 0.5;
    this.mainLight.shadow.camera.far = 500;
    this.mainLight.shadow.camera.left = -100;
    this.mainLight.shadow.camera.right = 100;
    this.mainLight.shadow.camera.top = 100;
    this.mainLight.shadow.camera.bottom = -100;
    this.ss.scene.add(this.mainLight);
    this.moonObjects.push(this.mainLight);

    this.fillLight = new THREE.AmbientLight(0x111122, 0.15);
    this.ss.scene.add(this.fillLight);
    this.moonObjects.push(this.fillLight);

    this.earthShine = new THREE.DirectionalLight(0x4488cc, 0.08);
    this.earthShine.position.set(-50, 40, 80);
    this.ss.scene.add(this.earthShine);
    this.moonObjects.push(this.earthShine);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 400 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; 
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi) + 50;
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const b = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = b;
      starColors[i * 3 + 1] = b;
      starColors[i * 3 + 2] = b + Math.random() * 0.3;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const moonStars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 1.2, vertexColors: true, transparent: true, opacity: 0.9
    }));
    this.ss.scene.add(moonStars);
    this.moonObjects.push(moonStars);
  }

  createMoonTerrain() {
    const size = 300;
    const segments = 250;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const posAttr = geo.attributes.position;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);

      let z = 0;
      z += Math.sin(x * 0.02) * Math.cos(y * 0.02) * 2;
      z += Math.sin(x * 0.05 + 1.5) * Math.cos(y * 0.07) * 1;
      z += Math.sin(x * 0.15) * Math.cos(y * 0.12) * 0.3;
      z += (Math.random() - 0.5) * 0.1;

      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter < 15) {
        z *= distFromCenter / 15;
      }

      posAttr.setZ(i, z);
    }
    geo.computeVertexNormals();

    const textureLoader = new THREE.TextureLoader();
    const moonTex = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
    moonTex.wrapS = THREE.RepeatWrapping;
    moonTex.wrapT = THREE.RepeatWrapping;
    moonTex.repeat.set(12, 12); 

    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xbbbbbb, 
      map: moonTex,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: false, 
    });

    this.moonGround = new THREE.Mesh(geo, moonMat);
    this.moonGround.rotation.x = -Math.PI / 2;
    this.moonGround.receiveShadow = true;
    this.ss.scene.add(this.moonGround);
    this.moonObjects.push(this.moonGround);
  }

  createCraters() {
    const craterData = [
      { x: 25, z: -20, r: 8, depth: 2 },
      { x: -30, z: 15, r: 6, depth: 1.5 },
      { x: 40, z: 35, r: 10, depth: 2.5 },
      { x: -45, z: -40, r: 7, depth: 1.8 },
      { x: 15, z: 50, r: 5, depth: 1.2 },
      { x: -20, z: -55, r: 9, depth: 2.2 },
      { x: 55, z: -10, r: 4, depth: 1 },
      { x: -60, z: 40, r: 12, depth: 3 },
      { x: 70, z: 20, r: 6, depth: 1.5 },
      { x: -10, z: 70, r: 8, depth: 2 },
    ];

    craterData.forEach(c => {
      const craterGeo = new THREE.CylinderGeometry(c.r, c.r * 0.7, c.depth, 48, 1, true);
      craterGeo.computeVertexNormals();
      const craterMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 1,
        flatShading: false, 
        side: THREE.DoubleSide
      });
      const crater = new THREE.Mesh(craterGeo, craterMat);
      crater.position.set(c.x, -c.depth / 2 + 0.1, c.z);
      crater.receiveShadow = true;
      this.ss.scene.add(crater);
      this.moonObjects.push(crater);

      const rimGeo = new THREE.TorusGeometry(c.r, c.depth * 0.4, 16, 48);
      rimGeo.computeVertexNormals();
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x7a7a7a,
        roughness: 0.9,
        flatShading: false 
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(c.x, 0.2, c.z);
      rim.rotation.x = Math.PI / 2;
      rim.castShadow = true;
      rim.receiveShadow = true;
      this.ss.scene.add(rim);
      this.moonObjects.push(rim);
    });

    for (let i = 0; i < 50; i++) {
      const r = 0.3 + Math.random() * 1.5;
      const microCraterGeo = new THREE.CircleGeometry(r, 24);
      const microCrater = new THREE.Mesh(
        microCraterGeo,
        new THREE.MeshStandardMaterial({
          color: 0x666666,
          roughness: 1,
        })
      );
      microCrater.rotation.x = -Math.PI / 2;
      microCrater.position.set(
        (Math.random() - 0.5) * 200,
        0.02,
        (Math.random() - 0.5) * 200
      );
      this.ss.scene.add(microCrater);
      this.moonObjects.push(microCrater);
    }
  }

  createRocks() {
    const rockColors = [0x777777, 0x888888, 0x999999, 0x6a6a6a, 0xaaaaaa];

    for (let i = 0; i < 60; i++) {
      const size = 0.3 + Math.random() * 2.5;
      const rockGeo = new THREE.DodecahedronGeometry(size, 2);

      const rockPosAttr = rockGeo.attributes.position;
      for (let j = 0; j < rockPosAttr.count; j++) {
        rockPosAttr.setX(j, rockPosAttr.getX(j) * (0.7 + Math.random() * 0.6));
        rockPosAttr.setY(j, rockPosAttr.getY(j) * (0.5 + Math.random() * 0.5));
        rockPosAttr.setZ(j, rockPosAttr.getZ(j) * (0.7 + Math.random() * 0.6));
      }
      rockGeo.computeVertexNormals();

      const rock = new THREE.Mesh(rockGeo, new THREE.MeshStandardMaterial({
        color: rockColors[Math.floor(Math.random() * rockColors.length)],
        roughness: 0.95,
        metalness: 0.05,
        flatShading: false 
      }));

      const dist = 10 + Math.random() * 120;
      const angle = Math.random() * Math.PI * 2;
      rock.position.set(
        Math.cos(angle) * dist,
        size * 0.3,
        Math.sin(angle) * dist
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.ss.scene.add(rock);
      this.moonObjects.push(rock);
    }

    for (let cluster = 0; cluster < 8; cluster++) {
      const cx = (Math.random() - 0.5) * 160;
      const cz = (Math.random() - 0.5) * 160;
      const clusterSize = 3 + Math.random() * 5;

      for (let i = 0; i < 5 + Math.floor(Math.random() * 8); i++) {
        const s = 0.2 + Math.random() * 1;
        const rockGeo = new THREE.DodecahedronGeometry(s, 2);
        rockGeo.computeVertexNormals();
        
        const rock = new THREE.Mesh(
          rockGeo,
          new THREE.MeshStandardMaterial({
            color: rockColors[Math.floor(Math.random() * rockColors.length)],
            roughness: 0.95, 
            flatShading: false
          })
        );
        rock.position.set(
          cx + (Math.random() - 0.5) * clusterSize,
          s * 0.3,
          cz + (Math.random() - 0.5) * clusterSize
        );
        rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        rock.castShadow = true;
        this.ss.scene.add(rock);
        this.moonObjects.push(rock);
      }
    }
  }

  createLandingModule() {
    const moduleGroup = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(1.2, 1.5, 2, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.6, flatShading: true });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2.5;
    body.castShadow = true;
    moduleGroup.add(body);

    const topGeo = new THREE.SphereGeometry(0.8, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3, metalness: 0.5, flatShading: true });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 3.5;
    top.castShadow = true;
    moduleGroup.add(top);

    const windowGeo = new THREE.CircleGeometry(0.25, 16);
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff, roughness: 0.1, metalness: 0.8, emissive: 0x224466, emissiveIntensity: 0.5
    });
    for (let i = 0; i < 3; i++) {
      const win = new THREE.Mesh(windowGeo, windowMat);
      const angle = (Math.PI * 2 / 3) * i;
      win.position.set(Math.cos(angle) * 1.21, 2.8, Math.sin(angle) * 1.21);
      win.lookAt(Math.cos(angle) * 5, 2.8, Math.sin(angle) * 5);
      moduleGroup.add(win);
    }

    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + Math.PI / 4;
      const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 4);
      const legMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.6 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(Math.cos(angle) * 1.5, 1, Math.sin(angle) * 1.5);
      leg.rotation.z = Math.cos(angle) * 0.3;
      leg.rotation.x = Math.sin(angle) * 0.3;
      moduleGroup.add(leg);

      const padGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 8);
      const pad = new THREE.Mesh(padGeo, legMat);
      pad.position.set(Math.cos(angle) * 1.8, 0.04, Math.sin(angle) * 1.8);
      moduleGroup.add(pad);

      const strutGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8, 4);
      const strut = new THREE.Mesh(strutGeo, legMat);
      strut.position.set(Math.cos(angle) * 1.3, 1.5, Math.sin(angle) * 1.3);
      strut.rotation.z = Math.cos(angle) * 0.15;
      strut.rotation.x = Math.sin(angle) * 0.15;
      moduleGroup.add(strut);
    }

    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = 4.5;
    moduleGroup.add(antenna);

    const dishGeo = new THREE.CircleGeometry(0.4, 8);
    const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5, side: THREE.DoubleSide }));
    dish.position.set(0, 5, 0);
    dish.rotation.x = -Math.PI / 4;
    moduleGroup.add(dish);

    const burnGeo = new THREE.CircleGeometry(3, 32);
    const burnMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1 });
    const burn = new THREE.Mesh(burnGeo, burnMat);
    burn.rotation.x = -Math.PI / 2;
    burn.position.y = 0.02;
    moduleGroup.add(burn);

    const ladderGroup = new THREE.Group();
    for (let step = 0; step < 6; step++) {
      const stepGeo = new THREE.BoxGeometry(0.5, 0.05, 0.08);
      const stepMesh = new THREE.Mesh(stepGeo, new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
      stepMesh.position.set(1.5, 0.3 + step * 0.35, 0);
      ladderGroup.add(stepMesh);
    }
    const railGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2, 4);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(1.5, 1.3, 0.2);
    ladderGroup.add(rail1);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(1.5, 1.3, -0.2);
    ladderGroup.add(rail2);
    moduleGroup.add(ladderGroup);

    moduleGroup.position.set(0, 0, 0);
    this.ss.scene.add(moduleGroup);
    this.moonObjects.push(moduleGroup);

    const moduleLight = new THREE.PointLight(0x88ccff, 0.5, 15);
    moduleLight.position.set(0, 3, 0);
    this.ss.scene.add(moduleLight);
    this.moonObjects.push(moduleLight);
  }

  createTurkishFlag() {
    const flagGroup = new THREE.Group();

    // Direk
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.75;
    pole.castShadow = true;
    flagGroup.add(pole);

    // Kumaş Çizimi (Canvas ile)
    const canvas = document.createElement('canvas');
    canvas.width = 600; 
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Kırmızı Arkaplan
    ctx.fillStyle = '#E30A17';
    ctx.fillRect(0, 0, 600, 400);

    // Beyaz Dış Daire (Hilal)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); 
    ctx.arc(220, 200, 100, 0, Math.PI * 2); 
    ctx.fill();
    
    // Kırmızı İç Daire (Hilalin içini oymak için)
    ctx.fillStyle = '#E30A17';
    ctx.beginPath(); 
    ctx.arc(245, 200, 80, 0, Math.PI * 2); 
    ctx.fill();

    // Beyaz Yıldız
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    let cx = 350, cy = 200, spikes = 5, outerR = 35, innerR = 15;
    let rot = Math.PI / 2 * 3; 
    let x = cx, y = cy; 
    let step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerR; y = cy + Math.sin(rot) * outerR; ctx.lineTo(x, y); rot += step;
        x = cx + Math.cos(rot) * innerR; y = cy + Math.sin(rot) * innerR; ctx.lineTo(x, y); rot += step;
    }
    ctx.lineTo(cx, cy - outerR); 
    ctx.closePath(); 
    ctx.fill();

    // Canvas'ı Texture olarak kullan (Siyah ekran hatasını çözer)
    const flagTex = new THREE.CanvasTexture(canvas);
    const flagWidth = 2; 
    const flagHeight = 1.33;
    const flagGeo = new THREE.PlaneGeometry(flagWidth, flagHeight, 30, 20); // Dalgalanma için segment sayısı yüksek
    const flagMat = new THREE.MeshStandardMaterial({ 
        map: flagTex, 
        side: THREE.DoubleSide, 
        roughness: 0.8 
    });

    this.flagMesh = new THREE.Mesh(flagGeo, flagMat);
    this.flagMesh.position.set(flagWidth / 2 + 0.04, 2.85, 0);
    this.flagMesh.castShadow = true;
    flagGroup.add(this.flagMesh);

    // Taban
    const baseGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 8);
    const baseMesh = new THREE.Mesh(baseGeo, poleMat);
    baseMesh.position.y = 0.05;
    flagGroup.add(baseMesh);

    flagGroup.position.set(4, 0, -3);
    this.ss.scene.add(flagGroup);
    this.moonObjects.push(flagGroup);
  }

  createEarthInSky() {
    const earthGroup = new THREE.Group();

    const earthGeo = new THREE.SphereGeometry(15, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTex = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      emissive: 0x112244,
      emissiveIntensity: 0.2,
      roughness: 0.8
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    const atmosGeo = new THREE.SphereGeometry(15.5, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    earthGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

    const cloudGeo = new THREE.SphereGeometry(15.2, 64, 64);
    const cloudTex = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    clouds.name = 'earthClouds';
    earthGroup.add(clouds);

    earthGroup.position.set(-150, 60, 200);
    this.earthInSky = earthGroup;
    this.ss.scene.add(earthGroup);
    this.moonObjects.push(earthGroup);
  }

  createSunInSky() {
    const sunGeo = new THREE.SphereGeometry(8, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(100, 80, -60);
    this.ss.scene.add(sun);
    this.moonObjects.push(sun);

    const glareGeo = new THREE.SphereGeometry(12, 32, 32);
    const glareMat = new THREE.MeshBasicMaterial({
      color: 0xffffaa, transparent: true, opacity: 0.08
    });
    const glare = new THREE.Mesh(glareGeo, glareMat);
    glare.position.copy(sun.position);
    this.ss.scene.add(glare);
    this.moonObjects.push(glare);
  }

  // --- KEŞİF NOKTALARI GERİ GELDİ ---
  createDiscoveryPoints() {
    const discoveries = [
      { x: 20, z: -15, title: "🔬 Ay Kayası Örneği", desc: "Bu bazaltik kaya yaklaşık 3.7 milyar yıl önce volkanik aktivite sonucu oluşmuştur.", color: 0x44aaff },
      { x: -25, z: 20, title: "🌋 Eski Lav Tüpü Girişi", desc: "Ay'ın yeraltında devasa lav tüpleri bulunmaktadır.", color: 0xff6644 },
      { x: 35, z: 30, title: "🧊 Buz Kristalleri", desc: "Ay'ın kutup bölgelerindeki kalıcı gölge kraterlerinde su buzu keşfedilmiştir.", color: 0x66ddff },
      { x: -40, z: -30, title: "👣 Tarihi Ayak İzi", desc: "Ay'da atmosfer olmadığı için astronot ayak izleri milyonlarca yıl bozulmadan kalabilir.", color: 0xffcc44 },
      { x: 50, z: -40, title: "📡 Eski Reflektör", desc: "Apollo astronotları tarafından bırakılan lazer reflektörleri hâlâ aktiftir.", color: 0xaa66ff },
      { x: -55, z: 45, title: "🪨 Regolith Katmanı", desc: "Ay yüzeyini kaplayan regolith, milyarlarca yıllık meteorit çarpmaları sonucu oluşmuş ince bir toz tabakasıdır.", color: 0xff88aa },
      { x: 15, z: 55, title: "🏔️ Wrinkle Ridge", desc: "Bu kırışıklık sırtı, Ay'ın soğuyup büzülmesiyle oluşmuştur.", color: 0x88ff88 },
      { x: -15, z: -50, title: "☀️ Güneş Rüzgârı İzleri", desc: "Ay'ın atmosferi olmadığı için güneş rüzgârı parçacıkları doğrudan yüzeye çarpar.", color: 0xffaa44 }
    ];
    discoveries.forEach((d, index) => {
      const group = new THREE.Group();
      group.userData = { ...d, discovered: false, index };

      const beamGeo = new THREE.CylinderGeometry(0.05, 0.3, 8, 8, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 4;
      beam.name = 'beam';
      group.add(beam);

      const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.8 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = 1;
      sphere.name = 'glow';
      group.add(sphere);

      const ringGeo = new THREE.RingGeometry(0.5, 0.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.05;
      ring.rotation.x = -Math.PI / 2;
      ring.name = 'ring';
      group.add(ring);

      const ring2Geo = new THREE.RingGeometry(0.9, 1, 32);
      const ring2Mat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.position.y = 0.03;
      ring2.rotation.x = -Math.PI / 2;
      ring2.name = 'ring2';
      group.add(ring2);

      this.createDiscoveryObject(group, d, index);

      group.position.set(d.x, 0, d.z);
      this.ss.scene.add(group);
      this.moonObjects.push(group);
      this.discoveryPoints.push(group);
    });
  }

  createDiscoveryObject(group, data, index) {
    let obj;
    switch (index) {
      case 0: obj = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.8, flatShading: true })); obj.position.y = 0.5; obj.rotation.set(0.5, 0.3, 0.2); break;
      case 1: obj = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.3, 8, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.95, flatShading: true })); obj.position.y = 0.3; obj.rotation.x = Math.PI / 2; break;
      case 2:
        const iceGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.15 + Math.random() * 0.2, 0), new THREE.MeshStandardMaterial({ color: 0xaaddff, transparent: true, opacity: 0.7, roughness: 0.1, metalness: 0.3 }));
          crystal.position.set((Math.random() - 0.5) * 0.8, 0.2 + Math.random() * 0.4, (Math.random() - 0.5) * 0.8);
          crystal.rotation.set(Math.random(), Math.random(), Math.random());
          iceGroup.add(crystal);
        }
        obj = iceGroup; break;
      case 3: obj = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1 })); obj.rotation.x = -Math.PI / 2; obj.position.y = 0.02; break;
      case 4: obj = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.1), new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.1, metalness: 0.9 })); obj.position.y = 0.5; obj.rotation.y = Math.PI / 6; break;
      case 5: obj = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 1, flatShading: true })); obj.position.y = 0.15; break;
      case 6: obj = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.5), new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, flatShading: true })); obj.position.y = 0.15; break;
      case 7:
        const particleGroup = new THREE.Group();
        for (let i = 0; i < 8; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffdd44 }));
          p.position.set((Math.random() - 0.5), 0.5 + Math.random() * 1.5, (Math.random() - 0.5));
          particleGroup.add(p);
        }
        obj = particleGroup; break;
    }
    if (obj) group.add(obj);
  }

  createDustParticles() {
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 200;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 40;
      dustPositions[i * 3 + 1] = Math.random() * 3;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    this.dustParticles = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0x999999, size: 0.05, transparent: true, opacity: 0.4
    }));
    this.ss.scene.add(this.dustParticles);
    this.moonObjects.push(this.dustParticles);
  }

  // --- ARAYÜZ GERİ GELDİ ---
  createHUD() {
    this.discoveryHUD = document.createElement('div');
    this.discoveryHUD.id = 'discovery-hud';
    this.discoveryHUD.innerHTML = `
      <div style="position: fixed; top: 80px; right: 20px; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px 20px; color: #fff; font-family: 'Orbitron', 'Space Grotesk', monospace; z-index: 10001; min-width: 200px;">
        <div style="font-size: 0.7rem; color: #00cec9; letter-spacing: 2px; margin-bottom: 8px;">KEŞİFLER</div>
        <div id="discovery-count" style="font-size: 1.5rem; font-weight: 700;">0 / ${this.totalDiscoveries}</div>
        <div style="margin-top: 8px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
          <div id="discovery-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6c5ce7, #00cec9); border-radius: 2px; transition: width 0.5s;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.discoveryHUD);

    this.interactionHint = document.createElement('div');
    this.interactionHint.id = 'interaction-hint';
    this.interactionHint.style.cssText = `position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(108, 92, 231, 0.3); border-radius: 10px; padding: 10px 20px; color: #fff; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; z-index: 10001; display: none; text-align: center; animation: fadeInUp 0.3s ease;`;
    document.body.appendChild(this.interactionHint);

    this.discoveryPanel = document.createElement('div');
    this.discoveryPanel.id = 'discovery-panel';
    this.discoveryPanel.style.cssText = `position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(10, 10, 30, 0.92); backdrop-filter: blur(15px); border: 1px solid rgba(108, 92, 231, 0.3); border-radius: 16px; padding: 24px 32px; color: #fff; font-family: 'Space Grotesk', sans-serif; z-index: 10001; max-width: 500px; width: 90%; display: none; text-align: center; animation: scaleIn 0.3s ease;`;
    document.body.appendChild(this.discoveryPanel);
  }

  bindControls() {
    this._keyDown = (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' && !this.isJumping) {
        this.isJumping = true;
        this.playerVel.y = 0.07; // 1'e 6 oranlı gerçekçi zıplama
      }
      if (e.code === 'KeyE') this.tryDiscover(); // 'E' Tuşu geri geldi
    };
    this._keyUp = (e) => { this.keys[e.code] = false; };

    this._ptrMove = (e) => {
      if (!this.isActive || document.pointerLockElement !== this.ss.canvas) return;
      this.yaw -= e.movementX * 0.002;
      this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch - e.movementY * 0.002));
    };

    this._ptrLockChange = () => {
      if (document.pointerLockElement !== this.ss.canvas && this.isActive) {
        setTimeout(() => { if (this.isActive) this.ss.canvas.requestPointerLock(); }, 300);
      }
    };

    this._click = () => {
      if (this.isActive) {
        if (document.pointerLockElement !== this.ss.canvas) {
          this.ss.canvas.requestPointerLock();
        } else {
          this.tryDiscover(); // Sol tık ile keşif
        }
      }
    };

    document.addEventListener('keydown', this._keyDown);
    document.addEventListener('keyup', this._keyUp);
    document.addEventListener('mousemove', this._ptrMove);
    document.addEventListener('pointerlockchange', this._ptrLockChange);
    this.ss.canvas.addEventListener('click', this._click);

    this.updateLoop();
  }

  // --- KEŞİF MEKANİĞİ GERİ GELDİ ---
  tryDiscover() {
    let nearest = null;
    let nearestDist = Infinity;

    this.discoveryPoints.forEach(point => {
      if (point.userData.discovered) return;
      const dist = this.playerPos.distanceTo(point.position);
      if (dist < nearestDist && dist < 6) {
        nearest = point;
        nearestDist = dist;
      }
    });

    if (nearest && !nearest.userData.discovered) {
      nearest.userData.discovered = true;
      this.discoveredCount++;

      const beam = nearest.getObjectByName('beam');
      const glow = nearest.getObjectByName('glow');
      if (beam) beam.material.opacity = 0.03;
      if (glow) { glow.material.color.setHex(0x44ff44); glow.material.opacity = 0.4; }

      const countEl = document.getElementById('discovery-count');
      const barEl = document.getElementById('discovery-bar');
      if (countEl) countEl.textContent = `${this.discoveredCount} / ${this.totalDiscoveries}`;
      if (barEl) barEl.style.width = `${(this.discoveredCount / this.totalDiscoveries) * 100}%`;

      this.showDiscoveryPanel(nearest.userData);
      this.interactionHint.style.display = 'none';
    }
  }

  showDiscoveryPanel(data) {
    this.discoveryPanel.innerHTML = `
      <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 10px; color: #${data.color.toString(16).padStart(6, '0')};">${data.title}</div>
      <p style="color: rgba(255,255,255,0.8); line-height: 1.7; font-size: 0.95rem; margin-bottom: 12px;">${data.desc}</p>
      <div style="font-size: 0.75rem; color: #00cec9;">${this.discoveredCount} / ${this.totalDiscoveries} keşif tamamlandı ${this.discoveredCount === this.totalDiscoveries ? ' — 🎉 Tüm keşifler tamamlandı!' : ''}</div>
    `;
    this.discoveryPanel.style.display = 'block';
    this.discoveryPanel.style.animation = 'none';
    this.discoveryPanel.offsetHeight;
    this.discoveryPanel.style.animation = 'scaleIn 0.3s ease';

    clearTimeout(this._panelTimeout);
    this._panelTimeout = setTimeout(() => {
      this.discoveryPanel.style.display = 'none';
    }, 4000);
  }

  updateLoop() {
    if (!this.isActive) return;

    this.headBobTimer = this.headBobTimer || 0;

    const speed = 0.06;
    const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const move = new THREE.Vector3();

    if (this.keys['KeyW']) move.add(fwd);
    if (this.keys['KeyS']) move.sub(fwd);
    if (this.keys['KeyA']) move.sub(right);
    if (this.keys['KeyD']) move.add(right);

    let currentSpeed = speed;
    if (this.keys['ShiftLeft']) currentSpeed = speed * 1.8;

    if (move.length() > 0) {
      move.normalize().multiplyScalar(currentSpeed);
      this.playerPos.x += move.x;
      this.playerPos.z += move.z;

      if(!this.isJumping) {
          this.headBobTimer += currentSpeed * 2.5;
      }

      this.footprintTimer++;
      if (this.footprintTimer > 15 && this.playerPos.distanceTo(this.lastFootprintPos) > 1) {
        this.createFootprint();
        this.footprintTimer = 0;
        this.lastFootprintPos.copy(this.playerPos);
      }
    } else {
      this.headBobTimer += (0 - this.headBobTimer) * 0.1; 
    }

    this.playerVel.y -= 0.0005; // Süzülerek düşme fiziği
    this.playerPos.y += this.playerVel.y;

    const groundHeight = this.getGroundHeight(this.playerPos.x, this.playerPos.z);
    const playerHeight = groundHeight + 1.7;
    
    if (this.playerPos.y <= playerHeight) {
      this.playerPos.y = playerHeight;
      this.playerVel.y = 0;
      this.isJumping = false;
    }

    const limit = 130;
    this.playerPos.x = Math.max(-limit, Math.min(limit, this.playerPos.x));
    this.playerPos.z = Math.max(-limit, Math.min(limit, this.playerPos.z));

    const bobOffset = Math.sin(this.headBobTimer) * 0.06;
    
    this.ss.camera.position.set(
        this.playerPos.x,
        this.playerPos.y + bobOffset,
        this.playerPos.z
    );
    
    this.ss.camera.lookAt(new THREE.Vector3(
      this.playerPos.x - Math.sin(this.yaw) * Math.cos(this.pitch),
      this.playerPos.y + bobOffset + Math.sin(this.pitch),
      this.playerPos.z - Math.cos(this.yaw) * Math.cos(this.pitch)
    ));
    
    this.ss.camera.fov = this.keys['ShiftLeft'] ? 75 : 65;
    this.ss.camera.updateProjectionMatrix();

    this.updateDiscoveryProximity(); // Yakınlık kontrolü geri geldi
    this.updateAnimations();

    if (this.dustParticles) {
      this.dustParticles.position.x = this.playerPos.x;
      this.dustParticles.position.z = this.playerPos.z;
    }

    requestAnimationFrame(() => this.updateLoop());
  }

  getGroundHeight(x, z) {
    let h = 0;
    h += Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2;
    h += Math.sin(x * 0.05 + 1.5) * Math.cos(z * 0.07) * 1;
    h += Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.3;
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter < 15) h *= distFromCenter / 15;
    return h;
  }

  updateDiscoveryProximity() {
    let nearestUndiscovered = null;
    let nearestDist = Infinity;

    this.discoveryPoints.forEach(point => {
      if (point.userData.discovered) return;
      const dist = this.playerPos.distanceTo(point.position);
      if (dist < nearestDist) {
        nearestUndiscovered = point;
        nearestDist = dist;
      }
    });

    if (nearestUndiscovered && nearestDist < 6) {
      this.interactionHint.innerHTML = `<span style="color: #${nearestUndiscovered.userData.color.toString(16).padStart(6, '0')};">●</span> ${nearestUndiscovered.userData.title} <br><span style="font-size: 0.75rem; color: #aaa;">Sol tık veya [E] ile keşfet</span>`;
      this.interactionHint.style.display = 'block';
    } else {
      this.interactionHint.style.display = 'none';
    }
  }

  updateAnimations() {
    const time = performance.now() * 0.001;

    // Keşif noktaları animasyonları geri geldi
    this.discoveryPoints.forEach((point, i) => {
      if (point.userData.discovered) return;

      const glow = point.getObjectByName('glow');
      const ring = point.getObjectByName('ring');
      const ring2 = point.getObjectByName('ring2');
      const beam = point.getObjectByName('beam');

      if (glow) {
        glow.position.y = 1 + Math.sin(time * 2 + i) * 0.3;
        const s = 1 + Math.sin(time * 3 + i) * 0.2;
        glow.scale.set(s, s, s);
      }
      if (ring) {
        ring.rotation.z = time * 0.5 + i;
        const rs = 1 + Math.sin(time * 2 + i) * 0.1;
        ring.scale.set(rs, rs, rs);
      }
      if (ring2) { ring2.rotation.z = -time * 0.3 + i; }
      if (beam) { beam.material.opacity = 0.08 + Math.sin(time * 1.5 + i) * 0.05; }
    });

    if (this.flagMesh) {
      const positions = this.flagMesh.geometry.attributes.position;
      const uvs = this.flagMesh.geometry.attributes.uv;
      
      for (let i = 0; i < positions.count; i++) {
        const uvX = uvs.getX(i); 
        const z = Math.sin(time * 3 + uvX * 5) * (uvX * 0.35);
        positions.setZ(i, z);
      }
      positions.needsUpdate = true;
    }

    if (this.earthInSky) {
      this.earthInSky.rotation.y = time * 0.02;
      const clouds = this.earthInSky.getObjectByName('earthClouds');
      if (clouds) clouds.rotation.y = time * 0.03;
    }
  }

  createFootprint() {
    const fpGeo = new THREE.PlaneGeometry(0.15, 0.3);
    const fpMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1, transparent: true, opacity: 0.6 });
    const fp = new THREE.Mesh(fpGeo, fpMat);
    fp.rotation.x = -Math.PI / 2;
    fp.rotation.z = this.yaw;
    fp.position.set(this.playerPos.x, 0.02, this.playerPos.z);
    this.ss.scene.add(fp);
    this.moonObjects.push(fp);
    this.footprints.push(fp);

    if (this.footprints.length > 100) {
      const old = this.footprints.shift();
      this.ss.scene.remove(old);
      old.geometry.dispose();
      old.material.dispose();
    }
  }

  startTimer() {
    const el = document.getElementById('explorationTimer');
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (el) {
        el.textContent = this.timeLeft;
        if (this.timeLeft <= 10) el.style.color = '#e74c3c';
        if (this.timeLeft <= 5) el.style.fontWeight = '900';
      }
      if (this.timeLeft <= 0) this.complete();
    }, 1000);
  }

  complete() {
    this.isActive = false;
    if (document.pointerLockElement) document.exitPointerLock();

    this.showResults();

    setTimeout(() => {
      this.cleanup();
      if (this.onComplete) this.onComplete();
    }, 5000);
  }

  showResults() {
    // 1. Bulunan keşifleri filtrele ve listele
    let discoveredItemsHTML = '';
    const foundItems = this.discoveryPoints.filter(p => p.userData.discovered);

    if (foundItems.length > 0) {
      discoveredItemsHTML = `
        <div style="margin-top: 15px; text-align: left; max-height: 140px; overflow-y: auto; padding-right: 5px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 15px;">
          <h4 style="color: #00cec9; font-size: 0.85rem; margin-bottom: 10px; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">BULUNAN KEŞİFLER:</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${foundItems.map(item => `
              <li style="margin-bottom: 8px; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 6px;">
                <span style="color: #${item.userData.color.toString(16).padStart(6, '0')}; text-shadow: 0 0 5px #${item.userData.color.toString(16).padStart(6, '0')};">●</span>
                ${item.userData.title}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    } else {
      discoveredItemsHTML = `
        <div style="margin-top: 15px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 15px;">
          <p style="color: #ff6b6b; font-size: 0.9rem; margin: 0;">Maalesef hiç keşif yapamadınız.</p>
        </div>
      `;
    }

    // 2. Ana sonuç ekranını oluştur
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); display: flex; align-items: center;
      justify-content: center; z-index: 10002; backdrop-filter: blur(10px);
      animation: fadeIn 0.5s ease;
    `;
    
    resultDiv.innerHTML = `
      <div style="
        background: rgba(15, 15, 40, 0.95); border: 1px solid rgba(108, 92, 231, 0.3);
        border-radius: 24px; padding: 40px; max-width: 450px; width: 90%; text-align: center;
        font-family: 'Space Grotesk', sans-serif; color: #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      ">
        <div style="font-size: 3rem; margin-bottom: 15px;">🌙</div>
        <h2 style="font-family: 'Orbitron', sans-serif; font-size: 1.4rem; color: #fdcb6e; margin-bottom: 15px;">
          Ay Keşfi Tamamlandı!
        </h2>
        
        <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 20px;">
          ${this.discoveredCount} / ${this.totalDiscoveries} keşif noktası bulundu.
          ${this.discoveredCount === this.totalDiscoveries ? '<br><span style="color: #00cec9;">🏆 Mükemmel! Tüm keşifleri tamamladınız!</span>' :
          this.discoveredCount >= 5 ? '<br><span style="color: #fdcb6e;">Harika bir performans!</span>' :
          '<br><span style="color: #ff6b6b;">Bir dahaki sefere daha fazlasını keşfedin!</span>'}
        </p>
        
        <div style="
          background: rgba(255,255,255,0.05); border-radius: 10px;
          padding: 12px; margin-bottom: 5px;
        ">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #aaa;">Keşifler</span>
            <span style="color: #00cec9; font-weight: 700;">${this.discoveredCount}/${this.totalDiscoveries}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #aaa;">Başarı</span>
            <span style="color: #fdcb6e; font-weight: 700;">${Math.round((this.discoveredCount / this.totalDiscoveries) * 100)}%</span>
          </div>
        </div>

        ${discoveredItemsHTML}
        
        <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 25px; margin-bottom: 0;">Güneş Sistemi'ne dönülüyor...</p>
      </div>
    `;
    document.body.appendChild(resultDiv);
    this._resultDiv = resultDiv;
  }

  cleanup() {
    if (this.discoveryHUD) this.discoveryHUD.remove();
    if (this.interactionHint) this.interactionHint.remove();
    if (this.discoveryPanel) this.discoveryPanel.remove();
    if (this._resultDiv) this._resultDiv.remove();
    clearTimeout(this._panelTimeout);

    this.moonObjects.forEach(obj => {
      this.ss.scene.remove(obj);
      if (obj.traverse) {
        obj.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else if (child.material.dispose) child.material.dispose();
          }
        });
      } else {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else if (obj.material.dispose) child.material.dispose();
        }
      }
    });
    this.moonObjects = [];
    this.discoveryPoints = []; 
    this.footprints = [];

    this.showSolarSystem();
  }

  dispose() {
    this.isActive = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    document.removeEventListener('keydown', this._keyDown);
    document.removeEventListener('keyup', this._keyUp);
    document.removeEventListener('mousemove', this._ptrMove);
    document.removeEventListener('pointerlockchange', this._ptrLockChange);
    if (this._click) this.ss.canvas.removeEventListener('click', this._click);
    if (document.pointerLockElement) document.exitPointerLock();
    this.cleanup();
  }
}
