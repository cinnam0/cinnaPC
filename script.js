let currentStep = 1;
let sweetTimeInterval = null; // Variable para controlar el intervalo de SweetTime

// Función para manejar el login
function login() {
    // Activar pantalla completa
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Safari
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }
    
    // Mostrar el desktop después de un pequeño delay para la animación
    setTimeout(() => {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('retro-bar').style.display = 'flex';
        document.getElementById('desktop').style.display = 'flex';
        
        // Iniciar animación de entrada
        document.getElementById('desktop').classList.add('desktop-enter');
    }, 300);
}

function nextStep(step) {
    document.getElementById(`step-${step}`).classList.remove('active');
    document.getElementById(`step-${step + 1}`).classList.add('active');

    if (step === 1) {
        const header = document.querySelector('#game-container header');
        if (header) {
            header.style.display = 'none'; // Oculta el mensaje de "Tienes un nuevo correo"
        }
    }
}

function showFinalMessage() {
    const step3 = document.getElementById("step-3");

    // Elimina los botones y el texto anterior
    step3.innerHTML = `
        <h2>¡SÍÍÍÍ!</h2>
        <p style="line-height: 1.6;">Prepárate para pasártelo súper bien (conmigo) (tu novio)</p>
        <img src="final.gif" alt="Celebración final" style="max-width: 35%; height: auto;">
        <p style="line-height: 1.6;">Al hacer clic en "Sí", usted ha ingresado en un compromiso 100% serio, legal e irrevocable con el remitente de esta solicitud.<br>
        Este acuerdo no admite devoluciones. Cualquier intento de retroceso será automáticamente redirigido a un tribunal de guerra y debidamente penado.<br><br>
        O no.</p>
    `;
    // Muestra el footer
    document.getElementById("footer").style.display = "block";
}

function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = now.getSeconds();
    const separator = seconds % 2 === 0 ? ':' : ' '; // Alterna entre ":" y " " cada segundo
    const time = `${hours}${separator}${minutes}`;

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const date = `${dayName} ${day} ${month} ${year}`;

    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
}

setInterval(updateDateTime, 1000);
updateDateTime();

function toggleAudio() {
    const audio = document.getElementById('background-audio');
    if (audio.paused) {
        audio.play();
        document.getElementById('audio-control').textContent = '🔊';
    } else {
        audio.pause();
        document.getElementById('audio-control').textContent = '🔇';
    }
}

function toggleFullscreen() {
    const button = document.getElementById('fullscreen-button');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        button.classList.add('fullscreen'); // Cambia el icono a pantalla2.svg
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            button.classList.remove('fullscreen'); // Cambia el icono a pantalla1.svg
        }
    }
}

// --- Funciones de ventanas ---

function positionWindow(container) {
    const retroBar = document.getElementById('retro-bar');
    container.style.display = 'block';
    
    const retroBarHeight = retroBar.offsetHeight;
    const padding = 20;
    
    container.style.top = (retroBarHeight + padding) + 'px';
    
    const windowWidth = window.innerWidth;
    const containerWidth = container.offsetWidth;
    container.style.left = Math.max(0, (windowWidth - containerWidth) / 2) + 'px';
}

function openNubeMail() {
    const emailSelectionContainer = document.getElementById('email-selection-container');
    positionWindow(emailSelectionContainer);
}

function closeNubeMail() {
    const emailSelectionContainer = document.getElementById('email-selection-container');
    const gameContainer = document.getElementById('game-container');
    const newAdventureContainer = document.getElementById('new-adventure-container');
    emailSelectionContainer.style.display = 'none';
    gameContainer.style.display = 'none';
    newAdventureContainer.style.display = 'none';
}

function openExistingEmail() {
    const emailSelectionContainer = document.getElementById('email-selection-container');
    const gameContainer = document.getElementById('game-container');
    emailSelectionContainer.style.display = 'none';
    positionWindow(gameContainer);
}

function backToEmailSelection() {
    const gameContainer = document.getElementById('game-container');
    const newAdventureContainer = document.getElementById('new-adventure-container');
    const emailSelectionContainer = document.getElementById('email-selection-container');
    gameContainer.style.display = 'none';
    newAdventureContainer.style.display = 'none';
    positionWindow(emailSelectionContainer);
}

function openNewAdventure() {
    const emailSelectionContainer = document.getElementById('email-selection-container');
    const newAdventureContainer = document.getElementById('new-adventure-container');
    emailSelectionContainer.style.display = 'none';
    positionWindow(newAdventureContainer);
}

function startNewAdventure() {
    document.getElementById('adventure-step-1').classList.remove('active');
    document.getElementById('adventure-step-2').classList.add('active');
    
    // Initialize the flappy game canvas if it hasn't been initialized
    setTimeout(() => {
        if (!flappyGame) {
            flappyGame = new FlappyGame();
        }
    }, 100);
}

function openMusicRoll() {
    const musicContainer = document.getElementById('music-container');
    positionWindow(musicContainer);
    updateMusicProgress();
}

function closeMusicRoll() {
    const musicContainer = document.getElementById('music-container');
    musicContainer.style.display = 'none';
}

function openLoveNote() {
    const noteContainer = document.getElementById('lovenote-container');
    positionWindow(noteContainer);
    
    const savedContent = localStorage.getItem('loveNoteContent');
    if (savedContent) {
        document.getElementById('note-text').value = savedContent;
    }
    
    setTimeout(() => {
        document.getElementById('note-text').focus();
    }, 100);
}

function closeLoveNote() {
    const noteContainer = document.getElementById('lovenote-container');
    const currentContent = document.getElementById('note-text').value;
    localStorage.setItem('loveNoteContent', currentContent);
    noteContainer.style.display = 'none';
}

function openWeather() {
    const weatherContainer = document.getElementById('weather-container');
    positionWindow(weatherContainer);
}

function closeWeather() {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.style.display = 'none';
}

function openSweetTime() {
    const sweetTimeContainer = document.getElementById('sweettime-container');
    positionWindow(sweetTimeContainer);
    updateSweetTime();
    if (sweetTimeInterval) clearInterval(sweetTimeInterval);
    sweetTimeInterval = setInterval(updateSweetTime, 60000);
}

function closeSweetTime() {
    const sweetTimeContainer = document.getElementById('sweettime-container');
    sweetTimeContainer.style.display = 'none';
    if (sweetTimeInterval) clearInterval(sweetTimeInterval);
}

function updateSweetTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const messages = [
        "¡Es hora de darse mimitos!",
        "¡Es hora de pensar en ti!",
        "¡Es hora de sonreír!",
        "¡Es hora de un abrazito!",
        "¡Es hora de cariñitos!",
        "¡Es hora de estar juntitas!"
    ];
    
    const digitalTime = document.querySelector('#sweettime-container .digital-time');
    const sweetMessage = document.querySelector('#sweettime-container .sweet-message');
    
    if (digitalTime && sweetMessage) {
        digitalTime.textContent = timeString;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        sweetMessage.textContent = randomMessage;
    }
}

function showTrashMessage(event) {
    const message = document.createElement('div');
    message.textContent = 'La papelera está vacía';
    message.style.position = 'fixed';
    message.style.top = `${event.clientY}px`;
    message.style.left = `${event.clientX}px`;
    message.style.backgroundColor = '#000';
    message.style.color = '#fff';
    message.style.padding = '5px 10px';
    message.style.borderRadius = '5px';
    message.style.fontSize = '12px';
    message.style.zIndex = '1000';
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.removeChild(message);
    }, 2000);
}


document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('background-audio');

    // --- Event Listeners para iconos del escritorio ---
    document.querySelector('.app-icon[data-app="trash"]').addEventListener('click', showTrashMessage);
    document.querySelector('.app-icon[data-app="nubemail"]').addEventListener('click', openNubeMail);
    document.querySelector('.app-icon[data-app="musicroll"]').addEventListener('click', openMusicRoll);
    document.querySelector('.app-icon[data-app="lovenote"]').addEventListener('click', openLoveNote);
    document.querySelector('.app-icon[data-app="weather"]').addEventListener('click', openWeather);
    document.querySelector('.app-icon[data-app="sweettime"]').addEventListener('click', openSweetTime);

    // --- Lógica de guardado para LoveLetter ---
    const noteText = document.getElementById('note-text');
    noteText.addEventListener('input', () => {
        localStorage.setItem('loveNoteContent', noteText.value);
    });

    // --- Lógica para el botón "No" ---
    const noButton = document.querySelector("#step-3 button:nth-of-type(2)");
    if (noButton) {
        noButton.addEventListener("mouseover", () => {
            const maxX = Math.min(window.innerWidth - noButton.offsetWidth - 20, 300);
            const maxY = Math.min(window.innerHeight - noButton.offsetHeight - 20, 300);

            let randomX, randomY;
            do {
                randomX = Math.random() * maxX;
                randomY = Math.random() * maxY;
            } while (
                Math.abs(randomX - noButton.offsetLeft) < 50 &&
                Math.abs(randomY - noButton.offsetTop) < 50
            );

            noButton.style.position = "absolute";
            noButton.style.left = `${randomX}px`;
            noButton.style.top = `${randomY}px`;
        });

        noButton.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
        });
    }

    // --- Lógica de reproducción de audio ---
    document.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(error => {
                console.error('Error al reproducir el audio tras interacción:', error);
            });
        }
    }, { once: true });

    audio.loop = true;

    // --- Comprobación de dispositivo móvil ---
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.innerHTML = `
            <div style="text-align: center; font-family: 'Press Start 2P', cursive; color: #ff69b4; padding: 20px;">
                <h1 style="font-size: 2rem;">⚠️ Aviso ⚠️</h1>
                <p style="font-size: 1.2rem;">No puedes acceder aquí desde dispositivos móviles.</p>
                <p style="font-size: 1.2rem;">Porfi, entra desde un ordenador para continuar. <br><br>:)</p>
            </div>
        `;
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.height = '100vh';
    }
});

function togglePlay() {
    const audio = document.getElementById('background-audio');
    const btn = document.getElementById('play-pause-btn');
    
    if (audio.paused) {
        audio.play();
        btn.textContent = '⏸';
    } else {
        audio.pause();
        btn.textContent = '▶';
    }
}

function updateMusicProgress() {
    const audio = document.getElementById('background-audio');
    const progress = document.querySelector('.progress');
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Actualizar el tiempo total inmediatamente si los metadatos ya están cargados
    if (audio.duration) {
        totalTime.textContent = formatTime(audio.duration);
    }

    // Evento para el tiempo total
    audio.addEventListener('loadedmetadata', () => {
        totalTime.textContent = formatTime(audio.duration);
    });

    // Evento para el tiempo actual y la barra de progreso
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = percent + '%';
        currentTime.textContent = formatTime(audio.currentTime);
    });
}
