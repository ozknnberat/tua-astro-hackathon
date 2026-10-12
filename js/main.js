/* ============================================
   MAIN.JS - Website Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.style.display = 'none', 500);
    }, 2500);

    // Hero canvas stars
    initHeroCanvas();

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Stat counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    const observerOptions = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, observerOptions);
    statNumbers.forEach(el => observer.observe(el));

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                navLinks.classList.remove('active');
            }
        });
    });

    // Game buttons
    const gameButtons = [
        document.getElementById('startGameBtn'),
        document.getElementById('heroGameBtn'),
        document.getElementById('playGameBtn')
    ];

    gameButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                startGame();
            });
        }
    });

    // Exit game
    document.getElementById('exitGameBtn').addEventListener('click', exitGame);
});

function animateCounter(el, target) {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current);
    }, 50);
}

function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random()
        });
    }

    const shootingStars = [];

    function createShootingStar() {
        if (Math.random() < 0.005) {
            shootingStars.push({
                x: Math.random() * canvas.width,
                y: 0,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 5 + 8,
                opacity: 1
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Stars
        stars.forEach(star => {
            star.opacity += (Math.random() - 0.5) * 0.02;
            star.opacity = Math.max(0.1, Math.min(1, star.opacity));

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();

            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });

        // Shooting stars
        createShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x - ss.length * 0.5, ss.y - ss.length);
            ctx.strokeStyle = `rgba(255, 255, 255, ${ss.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ss.x += ss.speed * 0.5;
            ss.y += ss.speed;
            ss.opacity -= 0.015;

            if (ss.opacity <= 0) shootingStars.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// Game management
let gameActive = false;
let solarSystemInstance = null;

function startGame() {
    gameActive = true;
    document.getElementById('gameContainer').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('controlsHelp').style.display = 'block';

    if (!solarSystemInstance) {
        solarSystemInstance = new SolarSystem();
    } else {
        solarSystemInstance.reset();
    }
}

function exitGame() {
    gameActive = false;
    document.getElementById('gameContainer').classList.add('hidden');
    document.body.style.overflow = '';

    if (solarSystemInstance) {
        solarSystemInstance.dispose();
        solarSystemInstance = null;
    }

    // Hide all panels
    document.querySelectorAll('.game-panel, .game-alert, .game-hud').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById('crosshair').classList.add('hidden');
}

/* ============================================
   MISSION MANAGER - Ay'a İlk Temas
   ============================================ */

class MissionManager {
    constructor(solarSystem) {
        this.ss = solarSystem;
        this.state = 'idle'; // idle, selecting, journey, quiz, complete, exploring
        this.selectedCraft = null;
        this.journeyProgress = 0;
        this.currentInfoIndex = 0;
        this.currentQuizIndex = 0;
        this.infoTimer = 0;
        this.journeyCraft = null;
        this.moonExplorer = null;

        // Info facts
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

        // Quiz questions (True/False based on facts)
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
        // Start mission
        document.getElementById('startMissionBtn').addEventListener('click', () => {
            document.getElementById('earthMissionAlert').classList.add('hidden');
            this.showSpacecraftSelection();
        });

        document.getElementById('cancelMissionBtn').addEventListener('click', () => {
            document.getElementById('earthMissionAlert').classList.add('hidden');
        });

        // Spacecraft selection
        document.querySelectorAll('.spacecraft-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.spacecraft-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedCraft = card.dataset.craft;
                document.getElementById('launchBtn').classList.remove('hidden');
            });
        });

        // Launch
        document.getElementById('launchBtn').addEventListener('click', () => {
            document.getElementById('spacecraftSelection').classList.add('hidden');
            this.startJourney();
        });

        // Quiz buttons
        document.getElementById('btnTrue').addEventListener('click', () => this.answerQuiz(true));
        document.getElementById('btnFalse').addEventListener('click', () => this.answerQuiz(false));

        // Mission complete buttons
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
        this.ss.currentView = 'journey';

        document.getElementById('journeyPanel').classList.remove('hidden');
        document.getElementById('gameStatus').textContent = 'Dünya → Ay Yolculuğu';

        // Create journey spacecraft
        this.createJourneyCraft();

        // Update first info
        this.updateInfoCard();
    }

    createJourneyCraft() {
        // Remove old craft if exists
        if (this.journeyCraft) {
            this.ss.scene.remove(this.journeyCraft);
        }

        const craftGroup = new THREE.Group();

        // Craft body
        const bodyGeo = new THREE.ConeGeometry(0.3, 1.2, 8);
        const bodyMat = new THREE.MeshPhongMaterial({
            color: this.selectedCraft === 'falcon' ? 0xcccccc :
                   this.selectedCraft === 'shuttle' ? 0xffffff : 0xdddddd,
            shininess: 80
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = -Math.PI / 2;
        craftGroup.add(body);

        // Engine glow
        const glowGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.8
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.z = 0.6;
        glow.name = 'engineGlow';
        craftGroup.add(glow);

        // Flame particles
        const flameGeo = new THREE.ConeGeometry(0.15, 0.8, 6);
        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.6
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.z = 1;
        flame.rotation.x = Math.PI / 2;
        flame.name = 'flame';
        craftGroup.add(flame);

        this.journeyCraft = craftGroup;
        this.ss.scene.add(this.journeyCraft);
    }

    updateInfoCard() {
        if (this.currentInfoIndex < this.facts.length) {
            document.getElementById('infoNumber').textContent = `${this.currentInfoIndex + 1}/10`;
            document.getElementById('infoText').textContent = this.facts[this.currentInfoIndex];

            // Animate card
            const card = document.getElementById('journeyInfoCard');
            card.style.animation = 'none';
            card.offsetHeight; // trigger reflow
            card.style.animation = 'fadeInUp 0.5s ease';
        }
    }

    update(time) {
        if (this.state === 'journey') {
            this.updateJourney(time);
        }
    }

    updateJourney(time) {
        // Progress
        this.journeyProgress += 0.0008;
        if (this.journeyProgress > 1) this.journeyProgress = 1;

        // Update progress bar
        const progressFill = document.getElementById('journeyProgress');
        progressFill.style.width = `${this.journeyProgress * 100}%`;
        document.getElementById('journeyPercent').textContent = `${Math.floor(this.journeyProgress * 100)}%`;

        // Update info cards every 10% progress
        const infoIndex = Math.min(Math.floor(this.journeyProgress * 10), 9);
        if (infoIndex !== this.currentInfoIndex) {
            this.currentInfoIndex = infoIndex;
            this.updateInfoCard();
        }

        // Update craft position
        const earthMesh = this.ss.planets['Dünya'].mesh;
        const moonMesh = this.ss.planets['Ay'].mesh;

        if (this.journeyCraft && earthMesh && moonMesh) {
            const earthPos = earthMesh.position.clone();
            const moonPos = moonMesh.position.clone();

            const craftPos = earthPos.lerp(moonPos, this.journeyProgress);
            this.journeyCraft.position.copy(craftPos);

            // Point craft toward moon
            this.journeyCraft.lookAt(moonPos);

            // Animate engine
            const flame = this.journeyCraft.getObjectByName('flame');
            if (flame) {
                flame.scale.y = 0.8 + Math.sin(time * 15) * 0.3;
                flame.material.opacity = 0.4 + Math.sin(time * 10) * 0.3;
            }

            // Camera follow craft
            const camOffset = new THREE.Vector3(0, 2, 5);
            const camPos = craftPos.clone().add(camOffset);
            this.ss.camera.position.lerp(camPos, 0.05);
            this.ss.camera.lookAt(craftPos);
        }

        // Journey complete
        if (this.journeyProgress >= 1) {
            this.completeJourney();
        }
    }

    completeJourney() {
        this.state = 'quiz';
        this.currentQuizIndex = 0;

        document.getElementById('journeyPanel').classList.add('hidden');
        document.getElementById('quizPanel').classList.remove('hidden');
        document.getElementById('gameStatus').textContent = 'Bilgi Testi';

        // Remove craft
        if (this.journeyCraft) {
            this.ss.scene.remove(this.journeyCraft);
            this.journeyCraft = null;
        }

        // Position camera at moon
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

        // Reset feedback
        const feedback = document.getElementById('quizFeedback');
        feedback.classList.add('hidden');
        feedback.classList.remove('correct', 'wrong');

        // Enable buttons
        document.getElementById('btnTrue').disabled = false;
        document.getElementById('btnFalse').disabled = false;
    }

    answerQuiz(answer) {
        const q = this.quizQuestions[this.currentQuizIndex];
        const feedback = document.getElementById('quizFeedback');
        const feedbackText = document.getElementById('feedbackText');

        if (answer === q.answer) {
            // Correct
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
            // Wrong - wait, don't advance
            feedback.classList.remove('hidden', 'correct');
            feedback.classList.add('wrong');
            feedbackText.textContent = '❌ Yanlış! Tekrar deneyin.';

            // Shake animation
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
        document.getElementById('gameStatus').textContent = 'Ay Yüzeyi Keşfi - 60 saniye';

        // Create moon explorer
        this.moonExplorer = new MoonExplorer(this.ss, () => {
            // Timer done - return to solar view
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

        // Return to solar system view
        this.ss.returnToSolarView();
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

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);