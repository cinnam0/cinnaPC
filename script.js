let currentStep = 1;

function nextStep(step) {
    document.getElementById(`step-${step}`).classList.remove('active');
    document.getElementById(`step-${step + 1}`).classList.add('active');

    if (step === 1) {
        const header = document.querySelector('header');
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

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.innerHTML = `
            <div style="text-align: center; font-family: 'Press Start 2P', cursive; color: #ff69b4;">
                <h1 style="font-size: 2rem;">⚠️ Aviso ⚠️</h1>
                <p style="font-size: 1.2rem;">No puedes acceder aquí desde dispositivos móviles.</p>
                <p style="font-size: 1.2rem;">Porfi, entra desde un ordenador para continuar. <br><br>:)</p>
            </div>
        `;
    }

    const gameContainer = document.getElementById('game-container');
    const windowBar = document.getElementById('window-bar'); // Solo permite arrastrar desde la barra superior

    let isDragging = false;
    let offsetX, offsetY;

    windowBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - gameContainer.offsetLeft;
        offsetY = e.clientY - gameContainer.offsetTop;
        gameContainer.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;

            // Limita el movimiento dentro de los límites de la pantalla
            const maxLeft = window.innerWidth - gameContainer.offsetWidth;
            const maxTop = window.innerHeight - gameContainer.offsetHeight;
            const minTop = document.getElementById('retro-bar').offsetHeight; // Altura de la barra superior

            gameContainer.style.left = `${Math.min(Math.max(0, newLeft), maxLeft)}px`;
            gameContainer.style.top = `${Math.min(Math.max(minTop, newTop), maxTop)}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        gameContainer.style.cursor = 'default';
    });

    const noButton = document.querySelector("#step-3 button:nth-of-type(2)"); // Selecciona el segundo botón dentro de step-3

    noButton.addEventListener("mouseover", () => {
        const maxX = Math.min(window.innerWidth - noButton.offsetWidth - 20, 300); // Limita el movimiento horizontal a un rango razonable
        const maxY = Math.min(window.innerHeight - noButton.offsetHeight - 20, 300); // Limita el movimiento vertical a un rango razonable

        let randomX, randomY;
        do {
            randomX = Math.random() * maxX;
            randomY = Math.random() * maxY;
        } while (
            Math.abs(randomX - noButton.offsetLeft) < 50 &&
            Math.abs(randomY - noButton.offsetTop) < 50
        ); // Asegura un movimiento mínimo

        noButton.style.position = "absolute";
        noButton.style.left = `${randomX}px`;
        noButton.style.top = `${randomY}px`;
    });

    noButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Evita cualquier funcionalidad del botón
        event.preventDefault();
    });

    const audio = document.getElementById('background-audio');

    // Asegura que el audio de fondo siempre se esté reproduciendo
    if (audio.paused) {
        audio.play().catch(error => {
            console.error('Error al reproducir el audio:', error);
        });
    }

    audio.loop = true; // Asegura que el audio se repita continuamente
});

document.addEventListener('click', () => {
    const audio = document.getElementById('background-audio');
    if (audio.paused) {
        audio.play().catch(error => {
            console.error('Error al reproducir el audio:', error);
        });
    }
}, { once: true }); // Se asegura de que el evento se ejecute solo una vez

document.addEventListener('click', () => {
    if (audio.paused) {
        audio.play().catch(error => {
            console.error('Error al reproducir el audio tras interacción:', error);
        });
    }
}, { once: true }); // Solo se ejecuta una vez tras la primera interacción del usuario
