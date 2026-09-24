
import { PhoneScene3D, ClassicScene3D, PixelTrail } from './PhoneScene3D.js';
import { CONFIG } from './config.js';

        // ============================================================
        // SHARED: audio player, DTMF, pixel trail, mode switching
        // ============================================================
        const playlist = [
            { title: "Ironic", artist: "Shel", src: "./audio/ironic.mp3" },
            { title: "Lafant", artist: "Shel", src: "./audio/Lafant.mp3" },
            { title: "Lil", artist: "Shel", src: "./audio/lil.mp3" },
            { title: "Thinking", artist: "Shel", src: "./audio/thinking.mp3" },
            { title: "TKOBH", artist: "Shel", src: "./audio/TKOBH.mp3" },
            { title: "Vintage", artist: "Shel", src: "./audio/vintage.mp3" }
        ];
        const audio = new Audio();
        try { audio.volume = Number(localStorage.getItem('shel-volume') ?? 0.3); } catch (e) { audio.volume = 0.3; }
        let currentTrackIndex = Math.floor(Math.random() * playlist.length);
        let isPlaying = false;

        const trackTitleEl = document.getElementById('track-title');
        const trackArtistEl = document.getElementById('track-artist');
        const volumeControl = document.getElementById('volume-control');
        volumeControl.value = audio.volume;
        volumeControl.addEventListener('input', () => {
            audio.volume = Number(volumeControl.value);
            try { localStorage.setItem('shel-volume', volumeControl.value); } catch (e) { }
        });
        const playBtn = document.getElementById('play-pause-btn');
        const nextBtn = document.getElementById('next-btn');
        const videoModal = document.getElementById('video-modal');
        const videoFrame = document.getElementById('video-frame');
        const videoModalTitle = document.getElementById('video-modal-title');
        const videoModalClose = document.getElementById('video-modal-close');
        const videoExternalLink = document.getElementById('video-external-link');

// --- VIDEO MODAL & MUSIC PLAYER UI ---
        function closeVideoModal() {
            videoModal.classList.remove('is-open');
            videoFrame.src = '';
        }

        document.querySelectorAll('[data-video-id]').forEach((videoButton) => {
            videoButton.addEventListener('click', () => {
                const videoId = videoButton.dataset.videoId;
                const title = videoButton.dataset.videoTitle;
                videoModalTitle.textContent = title;
                videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
                videoExternalLink.href = `https://www.youtube.com/watch?v=${videoId}`;
                videoModal.classList.add('is-open');
            });
        });
        videoModalClose.addEventListener('click', closeVideoModal);
        videoModal.addEventListener('click', (event) => {
            if (event.target === videoModal) closeVideoModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeVideoModal();
        });

        const svgPlay = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        const svgPause = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

        function loadTrack(index) {
            const track = playlist[index];
            audio.src = track.src;
            trackTitleEl.innerText = track.title;
            trackArtistEl.innerText = track.artist;
            if (isPlaying) audio.play().catch(() => { });
        }

        audio.addEventListener('error', () => {
            trackTitleEl.innerText = playerTranslations[langs[currentLangIndex]]['player.unavailable'];
            trackArtistEl.innerText = '—';
        });

        playBtn.addEventListener('click', () => {
            if (isPlaying) { audio.pause(); playBtn.innerHTML = svgPlay; }
            else { audio.play().catch(() => { }); playBtn.innerHTML = svgPause; }
            isPlaying = !isPlaying;
        });

        nextBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
            if (!isPlaying) { audio.play().catch(() => { }); playBtn.innerHTML = svgPause; isPlaying = true; }
        });
        audio.addEventListener('ended', () => nextBtn.click());
        loadTrack(currentTrackIndex);

        let audioStarted = false;
        const startAudio = () => {
            if (!audioStarted) {
                audio.play().catch(() => { });
                playBtn.innerHTML = svgPause;
                isPlaying = true;
                audioStarted = true;
                document.removeEventListener('click', startAudio);
                document.removeEventListener('touchstart', startAudio);
                document.removeEventListener('keydown', startAudio);
            }
        };
        document.addEventListener('click', startAudio);
        document.addEventListener('touchstart', startAudio);
        document.addEventListener('keydown', startAudio);

        let audioCtx = null;
        function getAudioCtx() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            return audioCtx;
        }
        function playDtmfSound() {
            if (prefersReducedMotion) return;
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();

            const freqs = [[697, 1209], [697, 1336], [697, 1477], [770, 1209], [770, 1336], [770, 1477]];
            const f = freqs[Math.floor(Math.random() * freqs.length)];

            osc1.frequency.value = f[0];
            osc2.frequency.value = f[1];

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 0.08);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc1.start(); osc2.start();
            osc1.stop(ctx.currentTime + 0.1); osc2.stop(ctx.currentTime + 0.1);
        }


// --- PHONE MENU LOGIC ---
        window.navigateTo = function (sectionId) {
            playDtmfSound();
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(sec => sec.classList.remove('active'));

            const activeSection = document.getElementById('menu-' + sectionId);
            if (activeSection) {
                activeSection.classList.add('active');
                document.getElementById('phone-screen').scrollTop = 0;
            }
            PhoneScene3D.updateCollage(sectionId);

        };

        document.querySelectorAll('[data-phone-section]').forEach((control) => {
            control.addEventListener('click', () => window.navigateTo(control.dataset.phoneSection));
        });



// --- MODE TOGGLE & OBSERVERS ---
        // ============================================================
        // MODE & LANG TOGGLE
        // ============================================================
        const body = document.body;
        const mode3dEl = document.getElementById('mode-3d');
        const modeClassicEl = document.getElementById('mode-classic');
        const toggleBtn = document.getElementById('mode-toggle');
        const toggleLabel = document.getElementById('mode-toggle-label');
        const langToggleBtn = document.getElementById('lang-toggle');
        const announcer = document.getElementById('mode-announcer');
        const bootVeil = document.getElementById('boot-veil');
        const STORAGE_KEY = 'shel-portfolio-mode-v2';

        function setMode(mode, announce) {
            if (mode === 'classic') {
                body.classList.remove('mode-3d'); body.classList.add('mode-classic');
                mode3dEl.style.display = 'none'; modeClassicEl.style.display = 'block';
                PhoneScene3D.stop(); ClassicScene3D.start();
                toggleLabel.setAttribute('data-i18n', 'controls.phone');
                toggleBtn.setAttribute('aria-pressed', 'true');
            } else {
                body.classList.remove('mode-classic'); body.classList.add('mode-3d');
                mode3dEl.style.display = 'block'; modeClassicEl.style.display = 'none';
                ClassicScene3D.stop(); PhoneScene3D.start();
                toggleLabel.setAttribute('data-i18n', 'controls.classic');
                toggleBtn.setAttribute('aria-pressed', 'false');
            }
            try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) { }
            if (window.i18n) window.i18n.updateDOM();
            if (announce) {
                announcer.textContent = mode === 'classic' ? 'Switched to classic view' : 'Switched to 3D phone view';
            }
            
        }

        toggleBtn.addEventListener('click', () => {
            const goingClassic = body.classList.contains('mode-3d');
            setMode(goingClassic ? 'classic' : '3d', true);
        });

        
        
        


        function setupClassicInteractions() {
            const classic = document.getElementById('mode-classic');
            const progress = document.getElementById('classic-progress');
            const sections = [...classic.querySelectorAll('.classic-section')];
            const navLinks = [...classic.querySelectorAll('.classic-nav-links a, .classic-nav-menu a')];
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            sections.forEach((section) => section.classList.add('reveal-ready'));

            const updateProgress = () => {
                const scrollable = document.documentElement.scrollHeight - window.innerHeight;
                const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
                progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            };
            window.addEventListener('scroll', updateProgress, { passive: true });
            updateProgress();

            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle('is-visible', entry.isIntersecting);
                });
            }, { threshold: 0.12 });

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
                });
            }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

            sections.forEach((section) => {
                revealObserver.observe(section);
            });
            const gridItems = [...classic.querySelectorAll(".grid-item")];
            gridItems.forEach((item) => revealObserver.observe(item));
            if (reducedMotion) gridItems.forEach((item) => item.classList.add("is-visible"));
            sections.forEach((section) => {
                sectionObserver.observe(section);
            });

            if (reducedMotion) sections.forEach((section) => section.classList.add('is-visible'));

            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const stat = entry.target;
                    const output = stat.querySelector('b');
                    const value = Number(stat.dataset.statValue);
                    if (!entry.isIntersecting) {
                        stat.classList.remove('is-counting');
                        if (Number.isFinite(value)) output.textContent = `0${stat.dataset.statSuffix || ''}`;
                        return;
                    }
                    stat.classList.add('is-counting');
                    if (!Number.isFinite(value)) return;
                    const suffix = stat.dataset.statSuffix || '';
                    if (reducedMotion) {
                        output.textContent = `${value}${suffix}`;
                        return;
                    }
                    const start = performance.now();
                    const duration = 1100;
                    const tick = (now) => {
                        const progressValue = Math.min(1, (now - start) / duration);
                        const eased = 1 - Math.pow(1 - progressValue, 3);
                        output.textContent = `${Math.round(value * eased)}${suffix}`;
                        if (progressValue < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                });
            }, { threshold: 0.5 });

            classic.querySelectorAll('.impact-stat').forEach((stat) => statsObserver.observe(stat));
        }

        setupClassicInteractions();

        let startMode = 'classic';
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'classic' || saved === '3d') startMode = saved;
        } catch (e) { }
            if (window.i18n) window.i18n.updateDOM();

        function hasWebGL() {
            try {
                const c = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
            } catch (e) { return false; }
        }
        

        
        // Re-apply language after mode init so phone-screen elements get translated
        

        


// --- EXPORTED CLASS ---

export class UIController {
    static init() {
        // Pixel Trail listener
        document.addEventListener('mousemove', (e) => {
            if (!document.body.classList.contains('mode-3d')) return; 
            PixelTrail.addPixel(e.clientX, e.clientY);
        });

        // Initialize UI logic
        setupClassicInteractions();
        
        // Initial setup calls
        if (!hasWebGL()) {
            document.getElementById('mode-3d').innerHTML = '<div style="color:var(--pink);text-align:center;padding:50px;">WebGL is required for 3D mode.</div>';
            startMode = 'classic';
        }
        
        setMode(startMode, false);
        const bootVeil = document.getElementById('boot-veil');
        if (bootVeil) {
            setTimeout(() => {
                bootVeil.classList.add('hidden');
            }, 250);
        }
    }
    
    static navigateTo(sectionId) {
        window.navigateTo(sectionId);
    }
}

// Ensure global navigateTo exists since HTML uses onclick="navigateTo(...)"
// Ensure global navigateTo exists since HTML uses onclick="navigateTo(...)"
window.navigateTo = function(sectionId) {
    // 1. Ocultar todas las secciones del menú
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    
    // 2. Mostrar la sección que el usuario clickeó
    const activeMenu = document.getElementById('menu-' + sectionId);
    if (activeMenu) {
        activeMenu.classList.add('active');
        const screen = document.getElementById('phone-screen');
        if (screen) screen.scrollTop = 0; // Regresar el scroll arriba
    }

    // 3. Actualizar el collage de imágenes 3D flotantes
    if (typeof PhoneScene3D !== 'undefined') {
        PhoneScene3D.updateCollage(sectionId);
    }
};
