// Window management system
let highestZIndex = 100;

function bringToFront(element) {
    highestZIndex++;
    element.style.zIndex = highestZIndex;
}

function setupWindowDragging(windowElement, handleElement) {
    let isDragging = false;
    let offsetX, offsetY;

    handleElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        bringToFront(windowElement);
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
        windowElement.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;

            const maxLeft = window.innerWidth - windowElement.offsetWidth;
            const maxTop = window.innerHeight - windowElement.offsetHeight;
            const minTop = document.getElementById('retro-bar').offsetHeight;

            windowElement.style.left = `${Math.min(Math.max(0, newLeft), maxLeft)}px`;
            windowElement.style.top = `${Math.min(Math.max(minTop, newTop), maxTop)}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (windowElement) {
            windowElement.style.cursor = 'grab';
        }
    });

    // Bring window to front when clicked anywhere
    windowElement.addEventListener('mousedown', () => {
        bringToFront(windowElement);
    });
}

// Initialize window management
document.addEventListener('DOMContentLoaded', () => {
    const emailSelectionContainer = document.getElementById('email-selection-container');
    const gameContainer = document.getElementById('game-container');
    const newAdventureContainer = document.getElementById('new-adventure-container');
    const musicContainer = document.getElementById('music-container');
    const loveNoteContainer = document.getElementById('lovenote-container');
    const weatherContainer = document.getElementById('weather-container');
    const sweetTimeContainer = document.getElementById('sweettime-container');

    if (emailSelectionContainer) {
        setupWindowDragging(emailSelectionContainer, emailSelectionContainer.querySelector('#window-bar'));
    }
    if (gameContainer) {
        setupWindowDragging(gameContainer, gameContainer.querySelector('#window-bar'));
    }
    if (newAdventureContainer) {
        setupWindowDragging(newAdventureContainer, newAdventureContainer.querySelector('#window-bar'));
    }
    if (musicContainer) {
        setupWindowDragging(musicContainer, musicContainer.querySelector('#window-bar'));
    }
    if (loveNoteContainer) {
        setupWindowDragging(loveNoteContainer, loveNoteContainer.querySelector('#window-bar'));
    }
    if (weatherContainer) {
        setupWindowDragging(weatherContainer, weatherContainer.querySelector('#window-bar'));
    }
    if (sweetTimeContainer) {
        setupWindowDragging(sweetTimeContainer, sweetTimeContainer.querySelector('#window-bar'));
    }
});
