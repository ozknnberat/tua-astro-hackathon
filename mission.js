/* ============================================
   MISSION MANAGER - Ay'a İlk Temas
   ============================================ */

class MissionManager {
    constructor(solarSystem) {
        this.ss = solarSystem;
        this.state = 'idle'; 
        this.selectedCraft = null;
        this.journeyProgress = 0;
        this.currentInfoIndex = 0;
        this.currentQuizIndex = 0;
        this.infoTimer = 0;
        this.journeyCraft = null;
        this.moonExplorer = null;

        this.facts = [
            "Ay, Dünya'nın tek doğal uydusudur ve yaklaşık 4.5 milyar yıl önce oluşmuştur.",
            "Dünya'dan Ay'a olan ortalama mesafe 384,400 km'dir. Işık bu mesafeyi yaklaşık 1.3 saniyede kat eder.",
            "Ay'ın yüzey alanı yaklaşık 37.9 milyon km²'dir. Bu, Afrika kıtasının yüzey alanına yakındır.",
            "Ay'da atmosfer yoktur, bu nedenle gökyüzü her zaman siyahtır ve yıldızlar gündüz bile görülebilir.",
            "Ay'daki yerçekimi, Dünya'nın yerçekiminin yaklaşık 1/6'sıdır. 60 kg olan bir kişi Ay'da sadece 10 kg gelir.",
            "Apollo 11 ile Neil Armstrong ve Buzz Aldrin, 20 Temmuz 1969'da Ay'a ayak basan ilk insanlar oldu.",
            "Ay'ın bir yüzü her zaman Dünya'ya bakar. Buna 'Gelgit Kilitlenmesi' denir.",
            "Ay yüzeyindeki sıcaklık gündüz +127°C'ye çıkarken, gece -173°C'ye düşer.",
            "Türkiye Uzay Ajansı (TUA), Türkiye'nin Ay'a yumuşak iniş yapma hedefini 2026-2028 yılları arasında gerçekleştirmeyi planlamaktadır.",
            "Ay'da bulunan regolitten oksijen üretilebilir. Bu, gelecekte Ay'da yaşamı mümkün kılabilir."
        ];

        this.quizQuestions = [
            { q: "Ay, Dünya'nın tek doğal uydusudur.", answer: true },
            { q: "Dünya'dan Ay'a olan mesafe yaklaşık 500,000 km'dir.", answer: false },
            { q: "Ay'ın yüzey alanı Afrika kıtasının yüzey alanına yakındır.", answer: true },
            { q: "Ay'da kalın bir atmosfer bulunmaktadır.", answer: false },
            { q: "Ay'daki yerçekimi Dünya'nın yerçekiminin yaklaşık 1/6'sıdır.", answer: true },
            { q: "Ay'a ayak basan ilk insan Buzz Aldrin'dir.", answer: false },
            { q: "Ay'ın bir yüzü her zaman Dünya'ya bakar, buna 'Gelgit Kilitlenmesi' denir.", answer: true },
            { q: "Ay yüzeyindeki sıcaklık gece -173°C'ye düşebilir.", answer: true },
            { q: "TUA'nın Ay'a yumuşak iniş hedefi 2030 yılındadır.", answer: false },
            { q: "Ay'daki regolitten oksijen üretilebilir.", answer: true }
        ];

        this.bindMissionEvents();
    }

    bindMissionEvents() {
        document.getElementById('startMissionBtn').addEventListener('click', () => {
            document.getElementById('earthMissionAlert').classList.add('hidden');
            this.showSpacecraftSelection();
        });

        document.getElementById('cancelMissionBtn').addEventListener('click', () => {
            document.getElementById('earthMissionAlert').classList.add('hidden');
        });

        document.querySelectorAll('.spacecraft-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.spacecraft-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedCraft = card.dataset.craft;
                document.getElementById('launchBtn').classList.remove('hidden');
            });
        });

        document.getElementById('launchBtn').addEventListener('click', () => {
            document.getElementById('spacecraftSelection').classList.add('hidden');
            this.startJourney();
        });

        document.getElementById('btnTrue').addEventListener('click', () => this.answerQuiz(true));
        document.getElementById('btnFalse').addEventListener('click', () => this.answerQuiz(false));

        document.getElementById('newMissionBtn').addEventListener('click', () => {
            this.showLockedMissionAlert();
        });

        document.getElementById('exploreMoonBtn').addEventListener('click', () => {
            document.getElementById('missionComplete').classList.add('hidden');
            this.startMoonExploration();
        });
    }

    showMissionAlert() {
        document.getElementById('earthMissionAlert').classList.remove('hidden');
    }

    showSpacecraftSelection() {
        this.state = 'selecting';
        document.getElementById('spacecraftSelection').classList.remove('hidden');
        document.getElementById('launchBtn').classList.add('hidden');
        document.querySelectorAll('.spacecraft-card').forEach(c => c.classList.remove('selected'));
        this.selectedCraft = null;
        document.getElementById('gameStatus').textContent = 'Görev: Ay\'a İlk Temas - Araç Seçimi';
    }

    startJourney() {
        this.state = 'journey';
        this.journeyProgress = 0;
        this.currentInfoIndex = 0;
        this.infoTimer = 0;
        this.journeyCurve = null; 
        this.ss.currentView = 'journey';

        document.getElementById('journeyPanel').classList.remove('hidden');
        document.getElementById('gameStatus').textContent = 'Dünya → Ay Yolculuğu';

        this.createJourneyCraft();
        this.updateInfoCard();
    }

    createJourneyCraft() {
        if (this.journeyCraft) this.ss.scene.remove(this.journeyCraft);
        const craftGroup = new THREE.Group();

        // Gerçekçi Roket Gövdesi
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.8, 24);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xeeeeee, metalness: 0.8, roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = -Math.PI / 2;
        craftGroup.add(body);

        // Roket Burnu
        const noseGeo = new THREE.ConeGeometry(0.25, 0.8, 24);
        const noseMat = new THREE.MeshStandardMaterial({
            color: 0x222222, metalness: 0.9, roughness: 0.1
        });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.z = -1.3;
        nose.rotation.x = -Math.PI / 2;
        craftGroup.add(nose);

        // Kanatçıklar (Fins)
        const finGeo = new THREE.BoxGeometry(0.05, 0.6, 0.4);
        const finMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 });
        for(let i=0; i<4; i++) {
            const fin = new THREE.Mesh(finGeo, finMat);
            const angle = (Math.PI / 2) * i;
            fin.position.set(Math.cos(angle)*0.35, Math.sin(angle)*0.35, 0.7);
            fin.rotation.z = angle;
            craftGroup.add(fin);
        }

        // Motor Çıkışı (Engine Bell)
        const engineGeo = new THREE.CylinderGeometry(0.35, 0.15, 0.4, 16);
        const engineMat = new THREE.MeshStandardMaterial({
            color: 0x111111, metalness: 0.9, roughness: 0.5
        });
        const engine = new THREE.Mesh(engineGeo, engineMat);
        engine.position.z = 1.1;
        engine.rotation.x = -Math.PI / 2;
        craftGroup.add(engine);

        // Alev (Flame)
        const flameGeo = new THREE.ConeGeometry(0.25, 2.0, 16);
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.z = 2.2;
        flame.rotation.x = Math.PI / 2;
        flame.name = 'flame';
        craftGroup.add(flame);

        // Motor Işığı
        const glowLight = new THREE.PointLight(0xff6600, 2, 10);
        glowLight.position.z = 1.5;
        craftGroup.add(glowLight);

        this.journeyCraft = craftGroup;
        this.ss.scene.add(this.journeyCraft);
    }

    updateInfoCard() {
        if (this.currentInfoIndex < this.facts.length) {
            document.getElementById('infoNumber').textContent = `${this.currentInfoIndex + 1}/10`;
            document.getElementById('infoText').textContent = this.facts[this.currentInfoIndex];

            const card = document.getElementById('journeyInfoCard');
            card.style.animation = 'none';
            card.offsetHeight; 
            card.style.animation = 'fadeInUp 0.5s ease';
        }
    }

    update(time) {
        if (this.state === 'journey') {
            this.updateJourney(time);
        }
    }

    updateJourney(time) {
        this.journeyProgress += 0.001; 
        if (this.journeyProgress > 1) this.journeyProgress = 1;

        const progressFill = document.getElementById('journeyProgress');
        progressFill.style.width = `${this.journeyProgress * 100}%`;
        document.getElementById('journeyPercent').textContent = `${Math.floor(this.journeyProgress * 100)}%`;

        const infoIndex = Math.min(Math.floor(this.journeyProgress * 10), 9);
        if (infoIndex !== this.currentInfoIndex) {
            this.currentInfoIndex = infoIndex;
            this.updateInfoCard();
        }

        const earthMesh = this.ss.planets['Dünya'].mesh;
        const moonMesh = this.ss.planets['Ay'].mesh;

        if (this.journeyCraft && earthMesh && moonMesh) {
            const earthPos = earthMesh.position.clone();
            const moonPos = moonMesh.position.clone();

            if (!this.journeyCurve) {
                const midPoint = earthPos.clone().lerp(moonPos, 0.5);
                midPoint.y += 25; 
                midPoint.z += 15; 
                this.journeyCurve = new THREE.QuadraticBezierCurve3(earthPos, midPoint, moonPos);
            }

            const craftPos = this.journeyCurve.getPoint(this.journeyProgress);
            this.journeyCraft.position.copy(craftPos);

            if (this.journeyProgress < 0.99) {
                const nextPos = this.journeyCurve.getPoint(this.journeyProgress + 0.01);
                this.journeyCraft.lookAt(nextPos);
                this.journeyCraft.rotateZ(Math.sin(this.journeyProgress * Math.PI) * 0.8);
            }

            const flame = this.journeyCraft.getObjectByName('flame');
            if (flame) {
                flame.scale.y = 0.8 + Math.sin(time * 30) * 0.4;
                flame.material.opacity = 0.5 + Math.sin(time * 20) * 0.5;
            }

            const camOffset = new THREE.Vector3(0, 2.5, 7);
            camOffset.applyQuaternion(this.journeyCraft.quaternion); 
            const targetCamPos = craftPos.clone().add(camOffset);
            
            this.ss.camera.position.lerp(targetCamPos, 0.08);
            this.ss.camera.lookAt(craftPos);
        }

        if (this.journeyProgress >= 1) {
            this.journeyCurve = null;
            this.completeJourney();
        }
    }

    completeJourney() {
        this.state = 'quiz';
        this.currentQuizIndex = 0;

        document.getElementById('journeyPanel').classList.add('hidden');
        document.getElementById('quizPanel').classList.remove('hidden');
        document.getElementById('gameStatus').textContent = 'Bilgi Testi';

        if (this.journeyCraft) {
            this.ss.scene.remove(this.journeyCraft);
            this.journeyCraft = null;
        }

        const moonPos = this.ss.planets['Ay'].mesh.position;
        this.ss.camera.position.set(moonPos.x + 3, moonPos.y + 2, moonPos.z + 3);
        this.ss.camera.lookAt(moonPos);

        this.showQuizQuestion();
    }

    showQuizQuestion() {
        if (this.currentQuizIndex >= this.quizQuestions.length) {
            this.showMissionComplete();
            return;
        }

        const q = this.quizQuestions[this.currentQuizIndex];
        document.getElementById('quizProgress').textContent = `${this.currentQuizIndex + 1}/10`;
        document.getElementById('questionText').textContent = q.q;

        const feedback = document.getElementById('quizFeedback');
        feedback.classList.add('hidden');
        feedback.classList.remove('correct', 'wrong');

        document.getElementById('btnTrue').disabled = false;
        document.getElementById('btnFalse').disabled = false;
    }

    answerQuiz(answer) {
        const q = this.quizQuestions[this.currentQuizIndex];
        const feedback = document.getElementById('quizFeedback');
        const feedbackText = document.getElementById('feedbackText');

        if (answer === q.answer) {
            feedback.classList.remove('hidden', 'wrong');
            feedback.classList.add('correct');
            feedbackText.textContent = '✅ Doğru! Tebrikler!';

            document.getElementById('btnTrue').disabled = true;
            document.getElementById('btnFalse').disabled = true;

            setTimeout(() => {
                this.currentQuizIndex++;
                this.showQuizQuestion();
            }, 1500);
        } else {
            feedback.classList.remove('hidden', 'correct');
            feedback.classList.add('wrong');
            feedbackText.textContent = '❌ Yanlış! Tekrar deneyin.';

            const questionEl = document.getElementById('quizQuestion');
            questionEl.style.animation = 'none';
            questionEl.offsetHeight;
            questionEl.style.animation = 'shake 0.5s ease';
        }
    }

    showMissionComplete() {
        this.state = 'complete';

        document.getElementById('quizPanel').classList.add('hidden');
        document.getElementById('missionComplete').classList.remove('hidden');
        document.getElementById('gameStatus').textContent = '🎉 Görev Tamamlandı!';
    }

    showLockedMissionAlert() {
        const alert = document.getElementById('planetLockedAlert');
        document.getElementById('lockedPlanetName').textContent = 'Bu görev şu anda kilitli..';
        alert.classList.remove('hidden');

        const closeBtn = document.getElementById('closeLockedAlert');
        const handler = () => {
            alert.classList.add('hidden');
            closeBtn.removeEventListener('click', handler);
        };
        closeBtn.addEventListener('click', handler);
    }

    startMoonExploration() {
        this.state = 'exploring';
        this.ss.currentView = 'moonExplore';

        document.getElementById('moonExplorationHUD').classList.remove('hidden');
        document.getElementById('crosshair').classList.remove('hidden');
        document.getElementById('gameStatus').style.display = 'none';

        this.moonExplorer = new MoonExplorer(this.ss, () => {
            this.endMoonExploration();
        });
    }

    endMoonExploration() {
        this.state = 'idle';

        document.getElementById('moonExplorationHUD').classList.add('hidden');
        document.getElementById('crosshair').classList.add('hidden');

        if (this.moonExplorer) {
            this.moonExplorer.dispose();
            this.moonExplorer = null;
        }

        // Oyun bitince ana menüye (web sitesine) dönüş yap
        if (typeof exitGame === 'function') {
            exitGame();
        } else {
            this.ss.returnToSolarView();
        }
    }

    dispose() {
        if (this.moonExplorer) {
            this.moonExplorer.dispose();
        }
        if (this.journeyCraft) {
            this.ss.scene.remove(this.journeyCraft);
        }
    }
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);