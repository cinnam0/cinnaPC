document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("step-2");

    // Create the game board
    const board = document.createElement("div");
    board.id = "game-board";
    gameContainer.appendChild(board);

    const images = [
        "ficha1.png", "ficha1.png",
        "ficha2.png", "ficha2.png",
        "ficha3.webp", "ficha3.webp",
        "ficha4.avif", "ficha4.avif",
        "ficha5.jpg", "ficha5.jpg",
        "ficha6.avif", "ficha6.avif",
        "ficha7.jpeg", "ficha7.jpeg",
        "ficha8.jpeg", "ficha8.jpeg"
    ];

    // Shuffle the images
    const shuffledImages = images.sort(() => 0.5 - Math.random());

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;

    function handleCardClick() {
        if (lockBoard || this === firstCard) return;

        this.classList.add("flipped");

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    // Create the tiles
    shuffledImages.forEach((image, index) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.image = image;

        const frontFace = document.createElement("div");
        frontFace.classList.add("front-face");
        
        const backFace = document.createElement("div");
        backFace.classList.add("back-face");
        backFace.style.backgroundImage = `url(${image})`;

        tile.appendChild(frontFace);
        tile.appendChild(backFace);
        board.appendChild(tile);

        tile.addEventListener("click", handleCardClick);
    });

    function checkForMatch() {
        const isMatch = firstCard.dataset.image === secondCard.dataset.image;

        if (isMatch) {
            disableCards();
            checkGameCompletion(); // Verifica si el juego se ha completado
        } else {
            unflipCards();
        }
    }

    function checkGameCompletion() {
        const allTiles = document.querySelectorAll(".tile");
        const allFlipped = Array.from(allTiles).every(tile => tile.classList.contains("flipped"));

        if (allFlipped) {
            const nextButton = document.querySelector("#step-2 button");
            nextButton.style.display = "block"; // Muestra el botón de siguiente
            nextButton.style.margin = "0 auto"; // Centra el botón
        }
    }

    // Oculta el botón de siguiente al inicio del juego
    const nextButton = document.querySelector("#step-2 button");
    nextButton.style.display = "none";

    function disableCards() {
        // Deshabilitar las cartas coincidentes
        firstCard.removeEventListener("click", handleCardClick);
        secondCard.removeEventListener("click", handleCardClick);

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "q") {
            const nextButton = document.querySelector("#step-2 button");
            nextButton.style.display = "block"; // Muestra el botón de siguiente
        }
    });
});
