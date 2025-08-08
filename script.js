// Refactor mínimo: encapsulamos lógica en un IIFE, reducimos duplicación y mantenemos API global usada por el HTML
// Todas las funciones originales siguen disponibles en window.* para no romper los onClick inline existentes

(() => {
    'use strict';

    // --- Estado interno ---
    let sweetTimeInterval = null;

    // --- Utilidades ---
    const qs = (sel, root = document) => root.querySelector(sel);
    const byId = id => document.getElementById(id);

    function requestFullscreenSafe() {
        const el = document.documentElement;
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
        if (el.msRequestFullscreen) return el.msRequestFullscreen();
    }

    function positionWindow(container) {
        if (!container) return;
        const retroBar = byId('retro-bar');
        container.style.display = 'block';
        const retroBarHeight = retroBar ? retroBar.offsetHeight : 0;
        const padding = 20;
        container.style.top = (retroBarHeight + padding) + 'px';
        const windowWidth = window.innerWidth;
        const containerWidth = container.offsetWidth;
        container.style.left = Math.max(0, (windowWidth - containerWidth) / 2) + 'px';
    }

    // Mapa declarativo de ventanas y lógica adicional al abrir/cerrar
    const windowConfig = {
        'email-selection-container': {},
        'game-container': {},
        'new-adventure-container': {},
        'music-container': { onOpen: () => updateMusicProgress() },
    'lovenote-container': { onOpen: restoreLoveNote, onClose: persistLoveNote },
    'weather-container': { onOpen: () => { if (!byId('cupid-forecast-list')) return; if (!byId('cupid-forecast-list').children.length) { renderCupidForecast(); } else { updateCupidDateBanner?.(); } } },
        'sweettime-container': { onOpen: startSweetTime, onClose: stopSweetTime },
    'lovestats-container': { onOpen: startLoveStats, onClose: stopLoveStats },
    'snake-adventure-container': {}
    };

    function openWindow(id) {
        const cfg = windowConfig[id];
        const el = byId(id);
        if (!el) return;
        positionWindow(el);
        cfg?.onOpen?.();
    }

    function closeWindow(id) {
        const cfg = windowConfig[id];
        const el = byId(id);
        if (!el) return;
        el.style.display = 'none';
        cfg?.onClose?.();
    }

    // --- API Pública (manteniendo nombres originales) ---
    function login() {
        requestFullscreenSafe();
        setTimeout(() => {
            byId('login-screen').style.display = 'none';
            byId('retro-bar').style.display = 'flex';
            const desktop = byId('desktop');
            desktop.style.display = 'flex';
            desktop.classList.add('desktop-enter');
        }, 300);
    }

    function nextStep(step) {
        const current = byId(`step-${step}`);
        const next = byId(`step-${step + 1}`);
        if (current) current.classList.remove('active');
        if (next) next.classList.add('active');
        if (step === 1) {
            const header = qs('#game-container header');
            if (header) header.style.display = 'none';
        }
    }

    function showFinalMessage() {
        const step3 = byId('step-3');
        if (!step3) return;
        step3.innerHTML = `
            <h2>¡SÍÍÍÍ!</h2>
            <p style="line-height: 1.6;">Prepárate para pasártelo súper bien (conmigo) (tu novio)</p>
            <img src="final.gif" alt="Celebración final" style="max-width: 35%; height: auto;">
            <p style="line-height: 1.6;">Al hacer clic en "Sí", usted ha ingresado en un compromiso 100% serio, legal e irrevocable con el remitente de esta solicitud.<br>
            Este acuerdo no admite devoluciones. Cualquier intento de retroceso será automáticamente redirigido a un tribunal de guerra y debidamente penado.<br><br>
            O no.</p>`;
        const footer = byId('footer');
        if (footer) footer.style.display = 'block';
    }

    function updateDateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = now.getSeconds();
        const separator = seconds % 2 === 0 ? ':' : ' ';
        const time = `${hours}${separator}${minutes}`;
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        const date = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        const timeSpan = byId('time');
        const dateSpan = byId('date');
        if (timeSpan) timeSpan.textContent = time;
        if (dateSpan) dateSpan.textContent = date;
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    function toggleFullscreen() {
        const button = byId('fullscreen-button');
        if (!document.fullscreenElement) {
            requestFullscreenSafe();
            button?.classList.add('fullscreen');
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
            button?.classList.remove('fullscreen');
        }
    }

    // --- Ventanas específicas (wrappers para compatibilidad) ---
    const openNubeMail = () => openWindow('email-selection-container');
    function closeNubeMail() {
        ['email-selection-container','game-container','new-adventure-container'].forEach(closeWindow);
    }
    function openExistingEmail() {
        closeWindow('email-selection-container');
        openWindow('game-container');
    }
    function backToEmailSelection() {
        ['game-container','new-adventure-container'].forEach(id => closeWindow(id));
        openWindow('email-selection-container');
    }
    function openNewAdventure() {
        closeWindow('email-selection-container');
        openWindow('new-adventure-container');
    }
    function startNewAdventure() {
        byId('adventure-step-1')?.classList.remove('active');
        byId('adventure-step-2')?.classList.add('active');
        setTimeout(() => { if (!window.flappyGame) window.flappyGame = new FlappyGame(); }, 100);
    }
    const openMusicRoll = () => openWindow('music-container');
    const closeMusicRoll = () => closeWindow('music-container');
    const openLoveNote = () => openWindow('lovenote-container');
    const closeLoveNote = () => closeWindow('lovenote-container');
    const openWeather = () => openWindow('weather-container');
    const closeWeather = () => closeWindow('weather-container');
    const openSweetTime = () => openWindow('sweettime-container');
    const closeSweetTime = () => closeWindow('sweettime-container');
    const openLoveStats = () => openWindow('lovestats-container');
    const closeLoveStats = () => closeWindow('lovestats-container');

    // --- SweetTime helpers ---
    function updateSweetTime() {
        const now = new Date();
        const hh = now.getHours().toString().padStart(2,'0');
        const mm = now.getMinutes().toString().padStart(2,'0');
        const messages = [
            '¡Es hora de darse mimitos!',
            '¡Es hora de pensar en ti!',
            '¡Es hora de sonreír!',
            '¡Es hora de un abrazito!',
            '¡Es hora de cariñitos!',
            '¡Es hora de estar juntitas!'
        ];
        const digitalTime = qs('#sweettime-container .digital-time');
        const sweetMessage = qs('#sweettime-container .sweet-message');
        if (digitalTime && sweetMessage) {
            digitalTime.textContent = `${hh}:${mm}`;
            sweetMessage.textContent = messages[Math.floor(Math.random()*messages.length)];
        }
    }
    function startSweetTime() {
        updateSweetTime();
        clearInterval(sweetTimeInterval);
        sweetTimeInterval = setInterval(updateSweetTime, 60000);
    }
    function stopSweetTime() { clearInterval(sweetTimeInterval); }

    // --- LoveStats helpers ---
    let loveStatsInterval = null;
    const RELATION_START = new Date('2025-05-12T00:00:00');
    const loveMessages = [
        'Cada minuto juntas suma magia ✨',
        'El tiempo solo mejora lo que sentimos 💕',
        'Hoy también te elijo 💖',
        'Los días pasan, nuestro cariño crece 🌸',
        'Eres mi momento favorito del día ☁️',
        'Nuestra línea de tiempo es preciosa 📼'
    ];
    const milestones = [30, 50, 75, 100, 150, 200, 250, 300]; // días

    function computeLoveStats() {
        const now = new Date();
        const diffMs = now - RELATION_START;
        const totalMinutes = Math.floor(diffMs / 60000);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        const totalWeeks = Math.floor(totalDays / 7);
        // Aproximación de meses: basado en días medios (30.437)
        const totalMonths = Math.floor(totalDays / 30.437);
        return { totalMinutes, totalHours, totalDays, totalWeeks, totalMonths };
    }

    function nextMilestone(days) {
        // Ya no se usan hitos específicos; mantenemos la función para compatibilidad si algo la invoca
        return null;
    }

    function renderLoveStats() {
        const { totalMinutes, totalHours, totalDays, totalWeeks, totalMonths } = computeLoveStats();
        const daysEl = byId('lovestats-days');
        if (!daysEl) return; // ventana puede estar cerrada
        daysEl.textContent = totalDays;
        byId('lovestats-weeks').textContent = totalWeeks;
        byId('lovestats-months').textContent = totalMonths;
        byId('lovestats-hours').textContent = totalHours;
        // (Eliminado: minutos totales y mensaje)
        // Progreso hasta 1 año (365 días) y próximo aniversario mensual (día 12)
        const oneYearDays = 365;
        const progressFill = byId('lovestats-progress');
        const milestoneEl = byId('lovestats-next-milestone');
        const progress = Math.min(1, totalDays / oneYearDays);
        if (progressFill) progressFill.style.width = (progress*100).toFixed(2) + '%';

        // Próximo aniversario mensual: siguiente día 12 desde hoy
        const now = new Date();
        let nextMonth = new Date(now.getFullYear(), now.getMonth(), 12);
        if (now.getDate() > 12) {
            nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 12);
        }
        const diffMs = nextMonth - now;
        const diffDays = Math.ceil(diffMs / 86400000);
        if (diffDays === 0) {
            milestoneEl.textContent = '¡Hoy es nuestro aniversario mensual! 🎉';
            daysEl.classList.add('lovestats-highlight');
        } else {
            milestoneEl.textContent = `Faltan ${diffDays} día${diffDays!==1?'s':''} para el siguiente día 12 ✨`;
            daysEl.classList.remove('lovestats-highlight');
        }
    }

    function startLoveStats() {
        renderLoveStats();
        clearInterval(loveStatsInterval);
        loveStatsInterval = setInterval(renderLoveStats, 60000); // refresco cada minuto
    }
    function stopLoveStats() { clearInterval(loveStatsInterval); }

    // --- LoveNote helpers ---
    function restoreLoveNote() {
        const savedContent = localStorage.getItem('loveNoteContent');
        if (savedContent) byId('note-text').value = savedContent;
        setTimeout(() => byId('note-text')?.focus(), 100);
    }
    function persistLoveNote() {
        const val = byId('note-text')?.value ?? '';
        localStorage.setItem('loveNoteContent', val);
    }

    // --- Otros ---
    function showTrashMessage(event) {
        const message = document.createElement('div');
        message.textContent = 'La papelera está vacía';
        Object.assign(message.style, {
            position: 'fixed', top: `${event.clientY}px`, left: `${event.clientX}px`,
            backgroundColor: '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px',
            fontSize: '12px', zIndex: '1000'
        });
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }

    function togglePlay() {
        const audio = byId('background-audio');
        const btn = byId('play-pause-btn');
        if (!audio || !btn) return;
        if (audio.paused) { audio.play(); btn.textContent = '⏸'; } else { audio.pause(); btn.textContent = '▶'; }
    }

    // --- CupidWeather ---
    let cupidModeReal = false; // fijo kawaii
    let cupidAutoRefreshTimer = null;
    let cupidCached = { mode:false, timestamp:0, data:[] };

    function cupidRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
    function generateKawaiiForecastBlock(startDate=new Date()) {
        // 8 bloques de 3h = 24h
        const blocks = [];
        const moods = [
            { emoji:'💋', desc:'Besitos de cariñito', chance:[85,100] },
            { emoji:'🤗', desc:'Oleada de abrazitos', chance:[70,95] },
            { emoji:'🌸', desc:'Florecillas románticas', chance:[60,90] },
            { emoji:'😴', desc:'Súper siesta', chance:[50,80] },
            { emoji:'🍰', desc:'Antojo de fuet', chance:[55,85] },
            { emoji:'💌', desc:'Mensajes amorosos', chance:[65,92] },
            { emoji:'✨', desc:'Tormenta de amor', chance:[75,98] },
            { emoji:'☁️', desc:'Nubes de algodoncito', chance:[40,70] },
            { emoji:'💞', desc:'Lluvia rositas', chance:[80,100] }
        ];
        for(let i=0;i<8;i++) {
            const d = new Date(startDate.getTime() + i*3*3600000);
            const hour = d.getHours().toString().padStart(2,'0')+':00';
            const mood = cupidRandom(moods);
            const ch = Math.floor(Math.random()*(mood.chance[1]-mood.chance[0]+1))+mood.chance[0];
            blocks.push({ time: hour, emoji: mood.emoji, desc: mood.desc, chance: ch+'%' });
        }
        return blocks;
    }
    function generateRealishForecastBlock(startDate=new Date()) {
        const baseTemps = [18,19,20,21,22,23,24,22];
        const phenomena = [
            { emoji:'☀️', desc:'Despejado' },
            { emoji:'🌤️', desc:'Parcial nubes' },
            { emoji:'⛅', desc:'Intervalos' },
            { emoji:'🌦️', desc:'Chubascos aisl.' },
            { emoji:'🌧️', desc:'Lluvia suave' }
        ];
        return baseTemps.map((t,i)=>{
            const d = new Date(startDate.getTime()+ i*3*3600000);
            const hour = d.getHours().toString().padStart(2,'0')+':00';
            const ph = cupidRandom(phenomena);
            const prob = ph.emoji==='🌧️'||ph.emoji==='🌦️'? (40+Math.floor(Math.random()*40)) : Math.floor(Math.random()*30);
            return { time: hour, emoji: ph.emoji, desc: ph.desc+` ${t}ºC`, chance: prob+'%' };
        });
    }
    function renderCupidForecast() {
        const list = byId('cupid-forecast-list');
        if(!list) return;
        const now = new Date();
        // Simple cache 10 min per mode
    if (cupidCached.mode===cupidModeReal && (now - cupidCached.timestamp) < 10*60000 && cupidCached.data.length) {
            // reuse
        } else {
            cupidCached = {
                mode: cupidModeReal,
                timestamp: now,
                data: (cupidModeReal? generateRealishForecastBlock(now) : generateKawaiiForecastBlock(now))
            };
        }
        list.innerHTML='';
        const data = cupidCached.data;
        // duplicar para scroll infinito
        const doubled = data.concat(data);
        doubled.forEach(item=>{
            const wrap = document.createElement('div');
            wrap.className='forecast-item';
            wrap.setAttribute('role','group');
            wrap.setAttribute('aria-label', `${item.time} ${item.desc} prob ${item.chance}`);
            const t = document.createElement('div'); t.className='forecast-time'; t.textContent=item.time;
            const e = document.createElement('div'); e.className='forecast-emoji'; e.textContent=item.emoji;
            const dsc = document.createElement('div'); dsc.className='forecast-desc'; dsc.textContent=item.desc;
            const ch = document.createElement('div'); ch.className='forecast-chance'; ch.textContent=item.chance;
            wrap.append(t,e,dsc,ch);
            list.appendChild(wrap);
        });
        updateCupidMetrics();
        spawnHearts(6);
        const container = byId('weather-container');
        if(container) {
            container.classList.toggle('cupid-mode-real', cupidModeReal);
            applyTimeOfDayTheme(container);
        }
    // Banner fecha
    updateCupidDateBanner();
    manageAutoRefresh();
    }
    function updateCupidMetrics() {
        const loveIndex = (85 + Math.floor(Math.random()*15));
        const abrazoUV = (5 + Math.floor(Math.random()*8));
        const cuddleAlert = ['MOD','ALTO','MÁX'][Math.floor(Math.random()*3)]; // nunca BAJO
        byId('love-index') && (byId('love-index').textContent = loveIndex);
        byId('abrazo-uv') && (byId('abrazo-uv').textContent = abrazoUV);
        byId('cuddle-alert') && (byId('cuddle-alert').textContent = cuddleAlert);
    }
    function refreshCupidWeather() { renderCupidForecast(); }
    function toggleCupidMode() { /* deshabilitado: siempre kawaii */ }
    function updateCupidDateBanner() {
        const banner = byId('cupid-today-banner');
        if(!banner) return;
        const now = new Date();
        const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        banner.textContent = `${dias[now.getDay()]} ${now.getDate()} de ${meses[now.getMonth()]} · Pronóstico Amoroso`;    }
    function spawnHearts(n=4) {
        const container = document.querySelector('#weather-container .weather-content');
        if(!container) return;
        for(let i=0;i<n;i++) {
            const h = document.createElement('div');
            h.className='heart-particle';
            h.textContent = cupidRandom(['💖','💗','💓','💞','💕']);
            h.style.left = Math.random()*90 + '%';
            h.style.bottom = '0px';
            h.style.animationDelay = (Math.random()*2)+'s';
            h.style.opacity = '0';
            container.appendChild(h);
            setTimeout(()=> h.remove(), 6000);
        }
    }

    // Ensure weather loads first time window opens
    const originalOpenWeather = openWeather;
    let cupidWeatherInitialized = false;
    window.openWeather = function() {
        originalOpenWeather();
        if(!cupidWeatherInitialized) {
            cupidWeatherInitialized = true;
            setTimeout(renderCupidForecast, 60);
        }
    };

    function manageAutoRefresh() {
        clearTimeout(cupidAutoRefreshTimer);
    // auto refresh cada 5 min si la ventana abierta
        const container = byId('weather-container');
        if(container && container.style.display !== 'none') {
            cupidAutoRefreshTimer = setTimeout(()=>{
        refreshCupidWeather();
            }, 5*60000);
        }
    }
    // scroll nunca se pausa, animación por CSS (sin controles)
    function applyTimeOfDayTheme(container) {
        const hour = new Date().getHours();
        let grad;
        if(hour < 6) grad = 'linear-gradient(135deg,#1b1b3a,#392d60)';
        else if(hour < 12) grad = 'linear-gradient(135deg,#fff9fb,#ffe6ee)';
        else if(hour < 18) grad = 'linear-gradient(135deg,#ffe6ee,#ffd0e6)';
        else grad = 'linear-gradient(135deg,#ffb6c1,#ff8fb4)';
        const wc = container.querySelector('.weather-content');
        if(wc) wc.style.background = grad;
    }

    function updateMusicProgress() {
        const audio = byId('background-audio');
        const progress = qs('.progress');
        const currentTime = byId('current-time');
        const totalTime = byId('total-time');
        if (!audio || !progress || !currentTime || !totalTime) return;
        const formatTime = s => {
            const m = Math.floor(s/60); const sec = Math.floor(s%60); return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; };
        if (audio.duration) totalTime.textContent = formatTime(audio.duration);
        audio.addEventListener('loadedmetadata', () => { totalTime.textContent = formatTime(audio.duration); }, { once: true });
        audio.addEventListener('timeupdate', () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = percent + '%';
            currentTime.textContent = formatTime(audio.currentTime);
        });
        initVisualizer();
    }
    
    // --- Lo-Fi Visualiser ---
    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let waveArray = null;
    let sourceNode = null;
    let visualizerRunning = false;

    function initVisualizer() {
        const audio = byId('background-audio');
        const barsCanvas = byId('visualizer-bars');
        const waveCanvas = byId('visualizer-wave');
        if (!audio || !barsCanvas || !waveCanvas) return;
        if (!window.AudioContext && !window.webkitAudioContext) {
            qs('.visualizer-fallback')?.style.setProperty('display','block');
            return;
        }
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048; // alta resolución para wave + barras
            const bufferLength = analyser.frequencyBinCount; // 1024
            dataArray = new Uint8Array(bufferLength);
            waveArray = new Uint8Array(bufferLength);
            // Crear fuente
            sourceNode = audioCtx.createMediaElementSource(audio);
            sourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);
        }
        if (!visualizerRunning) { visualizerRunning = true; drawVisualizer(); }
    }

    function drawVisualizer() {
        if (!visualizerRunning || !analyser) return;
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(waveArray);
        drawBars();
        drawWave();
        requestAnimationFrame(drawVisualizer);
    }

    function drawBars() {
        const canvas = byId('visualizer-bars');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0,0,w,h);
        const barCount = 42; // número estilizado
        const step = Math.floor(dataArray.length / barCount);
        for (let i=0;i<barCount;i++) {
            const v = dataArray[i*step] / 255; // 0..1
            const barHeight = Math.max(2, v * (h-4));
            const barWidth = (w - (barCount*2)) / barCount; // 2px gap
            const x = i * (barWidth + 2);
            // Degradado kawaii
            const grad = ctx.createLinearGradient(0, h-barHeight, 0, h);
            grad.addColorStop(0,'#ff1493');
            grad.addColorStop(1,'#ffb6c1');
            ctx.fillStyle = grad;
            ctx.fillRect(x, h - barHeight, barWidth, barHeight);
            // borde pixel
            ctx.strokeStyle = '#ff69b4';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, h - barHeight + 0.5, barWidth-1, barHeight-1);
        }
    }

    function drawWave() {
        const canvas = byId('visualizer-wave');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0,0,w,h);
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        const grad = ctx.createLinearGradient(0,0,w,0);
        grad.addColorStop(0,'#ff69b4');
        grad.addColorStop(1,'#ff1493');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        const slice = w / waveArray.length;
        for (let i=0;i<waveArray.length;i+=4) { // saltar puntos para suavizar
            const v = waveArray[i]/128.0; // ~1 around centro
            const y = (v * h/2);
            const x = i * slice;
            if (i===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }
        ctx.stroke();
        // línea base
        ctx.strokeStyle = 'rgba(255,105,180,0.4)';
        ctx.beginPath();
        ctx.moveTo(0,h/2);
        ctx.lineTo(w,h/2);
        ctx.stroke();
    }

    // --- Inicialización DOM ---
    document.addEventListener('DOMContentLoaded', () => {
        const audio = byId('background-audio');

        // Iconos escritorio (delegación básica por data-app)
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const app = icon.getAttribute('data-app');
                switch(app) {
                    case 'trash': return showTrashMessage(e);
                    case 'nubemail': return openNubeMail();
                    case 'musicroll': return openMusicRoll();
                    case 'lovenote': return openLoveNote();
                    case 'weather': return openWeather();
                    case 'sweettime': return openSweetTime();
                    case 'lovestats': return openLoveStats();
                }
            });
        });

        // Guardado LoveNote en tiempo real
        byId('note-text')?.addEventListener('input', e => localStorage.setItem('loveNoteContent', e.target.value));

        // Botón "No"
        const noButton = qs('#step-3 button:nth-of-type(2)');
        if (noButton) {
            noButton.addEventListener('mouseover', () => {
                const maxX = Math.min(window.innerWidth - noButton.offsetWidth - 20, 300);
                const maxY = Math.min(window.innerHeight - noButton.offsetHeight - 20, 300);
                let rx, ry;
                do { rx = Math.random()*maxX; ry = Math.random()*maxY; } while (Math.abs(rx - noButton.offsetLeft) < 50 && Math.abs(ry - noButton.offsetTop) < 50);
                noButton.style.position = 'absolute';
                noButton.style.left = `${rx}px`;
                noButton.style.top = `${ry}px`;
            });
            noButton.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); });
        }

        // Autoplay tras primera interacción
        document.addEventListener('click', () => { if (audio?.paused) audio.play().catch(()=>{}); }, { once: true });
        if (audio) audio.loop = true;

        // Bloqueo móvil
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.innerHTML = `<div style="text-align: center; font-family: 'Press Start 2P', cursive; color: #ff69b4; padding: 20px;">\n                <h1 style="font-size: 2rem;">⚠️ Aviso ⚠️</h1>\n                <p style=\"font-size: 1.2rem;\">No puedes acceder aquí desde dispositivos móviles.</p>\n                <p style=\"font-size: 1.2rem;\">Porfi, entra desde un ordenador para continuar. <br><br>:)</p>\n            </div>`;
            Object.assign(document.body.style, { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' });
        }
    });

    // Exponer API pública sin romper llamadas existentes
    Object.assign(window, {
        login,
        nextStep,
        showFinalMessage,
        toggleFullscreen,
        openNubeMail,
        closeNubeMail,
        openExistingEmail,
        backToEmailSelection,
        openNewAdventure,
        startNewAdventure,
        openMusicRoll,
        closeMusicRoll,
        openLoveNote,
        closeLoveNote,
        openWeather,
        closeWeather,
        openSweetTime,
        closeSweetTime,
        openLoveStats,
        closeLoveStats,
        togglePlay,
    updateMusicProgress, // usado al abrir music player
    refreshCupidWeather,
    toggleCupidMode
    });
})();
