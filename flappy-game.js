// Flappy Bird game for Cinnamoroll adventure
class FlappyGame {
    constructor() {
        this.canvas = document.getElementById('flappyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.gameCompleted = false;
        
        // Load pipe sprite
        this.pipeImage = new Image();
        this.pipeImage.src = 'pipe-pink.png';
        this.pipeImageLoaded = false;
        this.pipeImage.onload = () => {
            this.pipeImageLoaded = true;
        };
        
        // Load Cinnamoroll plane sprite
        this.playerImage = new Image();
        this.playerImage.src = 'plane-cinnamoroll.gif';
        this.playerImageLoaded = false;
        this.playerImage.onload = () => {
            this.playerImageLoaded = true;
        };
        
        // Game settings
        this.gravity = 0.4;
        this.jumpForce = -6.5; // Reduced from -8 to -6.5 for gentler jumps
        this.pipeSpeed = 2;
        this.pipeGap = 180; // Increased gap for easier gameplay
        this.survivalTime = 30; // seconds to survive
        
        // Player (Cinnamoroll)
        this.player = {
            x: 100,
            y: this.canvas.height / 2,
            width: 60, // Increased from 40 to 60
            height: 60, // Increased from 40 to 60
            velocity: 0,
            color: '#FFE4E1'
        };
        
        // Create animated player element overlay AFTER player is defined
        this.createAnimatedPlayer();
        
        // Pipes (clouds)
        this.pipes = [];
        this.pipeTimer = 0;
        
        // Destination markers
        this.destinations = ['Sevilla', 'Córdoba', 'Herrera', 'Granada'];
        this.currentDestinationIndex = 0;
        this.destinationMarker = null;
        this.markerTimer = 0;
        this.markerDuration = 7.5; // Show each marker for 7.5 seconds (30/4 = 7.5)
        
        // Game state
        this.startTime = 0;
        this.currentTime = 0;
        
        this.setupControls();
        this.gameLoop();
    }
    
    createAnimatedPlayer() {
        // Create animated GIF overlay element
        this.animatedPlayer = document.createElement('img');
        this.animatedPlayer.src = 'plane-cinnamoroll.gif';
        this.animatedPlayer.style.position = 'absolute';
        this.animatedPlayer.style.width = this.player.width + 'px';
        this.animatedPlayer.style.height = this.player.height + 'px';
        this.animatedPlayer.style.pointerEvents = 'none'; // Don't interfere with canvas clicks
        this.animatedPlayer.style.zIndex = '1000';
        this.animatedPlayer.style.display = 'none';
        this.animatedPlayer.style.transform = 'scaleX(-1)'; // Mirror horizontally
        document.body.appendChild(this.animatedPlayer);
    }
    
    updateAnimatedPlayerPosition() {
        if (this.animatedPlayer && this.isPlaying) {
            const canvasRect = this.canvas.getBoundingClientRect();
            const left = canvasRect.left + this.player.x;
            const top = canvasRect.top + this.player.y;
            
            this.animatedPlayer.style.left = left + 'px';
            this.animatedPlayer.style.top = top + 'px';
            this.animatedPlayer.style.display = 'block';
        } else if (this.animatedPlayer) {
            this.animatedPlayer.style.display = 'none';
        }
    }
    
    setupControls() {
        // Click control
        this.canvas.addEventListener('click', () => {
            if (this.isPlaying && !this.gameCompleted) {
                this.jump();
            }
        });
        
        // Keyboard control
        document.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.key === ' ') && this.isPlaying && !this.gameCompleted) {
                e.preventDefault();
                this.jump();
            }
        });
    }
    
    jump() {
        this.player.velocity = this.jumpForce;
    }
    
    update() {
        if (!this.isPlaying || this.gameCompleted) return;
        
        // Update timer
        this.currentTime = (Date.now() - this.startTime) / 1000;
        
        // Update destination markers
        this.updateDestinationMarkers();
        
        // Check if survived long enough
        if (this.currentTime >= this.survivalTime) {
            this.completeGame();
            return;
        }
        
        // Update player
        this.player.velocity += this.gravity;
        this.player.y += this.player.velocity;
        
        // Check bounds
        if (this.player.y < 0 || this.player.y + this.player.height > this.canvas.height) {
            this.resetGame();
            return;
        }
        
        // Update pipes
        this.pipeTimer++;
        if (this.pipeTimer % 120 === 0) { // New pipe every 2 seconds at 60fps
            this.addPipe();
        }
        
        // Move and remove pipes
        this.pipes = this.pipes.filter(pipe => {
            pipe.x -= this.pipeSpeed;
            return pipe.x + pipe.width > 0;
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    addPipe() {
        const pipeWidth = 100; // Increased from 80 to 100 for wider pipes
        const minPipeHeight = 50;
        const maxPipeHeight = this.canvas.height - this.pipeGap - minPipeHeight;
        const pipeHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
        const extraHeight = 10; // Extra pixels to extend beyond canvas edges
        
        // Top pipe - starts above canvas and goes to pipeHeight
        this.pipes.push({
            x: this.canvas.width,
            y: -extraHeight, // Start above the canvas
            width: pipeWidth,
            height: pipeHeight + extraHeight, // Extended height
            type: 'top'
        });
        
        // Bottom pipe - starts after gap and extends below canvas
        this.pipes.push({
            x: this.canvas.width,
            y: pipeHeight + this.pipeGap,
            width: pipeWidth,
            height: this.canvas.height - (pipeHeight + this.pipeGap) + extraHeight, // Extended height
            type: 'bottom'
        });
    }
    
    checkCollisions() {
        // Use circular collision detection for more accurate results
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const playerRadius = this.player.width / 3; // Smaller radius for more forgiving collision
        
        for (let pipe of this.pipes) {
            // Check if player circle intersects with pipe rectangle
            // Find the closest point on the rectangle to the circle center
            const closestX = Math.max(pipe.x, Math.min(playerCenterX, pipe.x + pipe.width));
            const closestY = Math.max(pipe.y, Math.min(playerCenterY, pipe.y + pipe.height));
            
            // Calculate distance from circle center to closest point
            const distanceX = playerCenterX - closestX;
            const distanceY = playerCenterY - closestY;
            const distanceSquared = distanceX * distanceX + distanceY * distanceY;
            
            // Check if collision occurred (with slightly smaller radius for forgiveness)
            if (distanceSquared < (playerRadius - 5) * (playerRadius - 5)) {
                this.resetGame();
                return;
            }
        }
    }
    
    updateDestinationMarkers() {
        // Calculate which destination should be shown based on current time
        const expectedDestinationIndex = Math.floor(this.currentTime / this.markerDuration);
        
        // Update current destination if needed
        if (expectedDestinationIndex !== this.currentDestinationIndex && expectedDestinationIndex < this.destinations.length) {
            this.currentDestinationIndex = expectedDestinationIndex;
            this.showDestinationMarker();
        }
    }
    
    showDestinationMarker() {
        const destination = this.destinations[this.currentDestinationIndex];
        if (!destination) return;
        
        // Create or update destination marker
        if (!this.destinationMarker) {
            this.destinationMarker = document.createElement('div');
            this.destinationMarker.style.position = 'absolute';
            this.destinationMarker.style.backgroundColor = 'rgba(255, 182, 193, 0.9)';
            this.destinationMarker.style.color = '#FF1493';
            this.destinationMarker.style.padding = '15px 30px';
            this.destinationMarker.style.borderRadius = '25px';
            this.destinationMarker.style.fontFamily = '"Press Start 2P", monospace';
            this.destinationMarker.style.fontSize = '16px';
            this.destinationMarker.style.fontWeight = 'bold';
            this.destinationMarker.style.border = '3px solid #FF1493';
            this.destinationMarker.style.zIndex = '1001';
            this.destinationMarker.style.pointerEvents = 'none';
            this.destinationMarker.style.textAlign = 'center';
            this.destinationMarker.style.animation = 'fadeInOut 0.5s ease-in';
            this.destinationMarker.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            document.body.appendChild(this.destinationMarker);
        }
        
        // Update marker content
        this.destinationMarker.textContent = `Próximo destino: ${destination}`;
        
        // Center marker horizontally and position above the canvas
        const canvasRect = this.canvas.getBoundingClientRect();
        const markerWidth = this.destinationMarker.offsetWidth;
        this.destinationMarker.style.left = (canvasRect.left + (canvasRect.width - markerWidth) / 2) + 'px';
        this.destinationMarker.style.top = (canvasRect.top - 60) + 'px'; // 60px above the canvas
        this.destinationMarker.style.display = 'block';
    }
    
    draw() {
        // Clear canvas with sky blue background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds pattern
        this.drawClouds();
        
        // Draw pipes using sprite
        if (this.pipeImageLoaded) {
            this.pipes.forEach(pipe => {
                if (pipe.type === 'top') {
                    // Draw top pipe (flipped vertically) - extends above canvas
                    this.ctx.save();
                    this.ctx.scale(1, -1);
                    this.ctx.drawImage(
                        this.pipeImage, 
                        pipe.x, 
                        -(pipe.y + pipe.height), // Adjust for extended height
                        pipe.width, 
                        pipe.height
                    );
                    this.ctx.restore();
                } else {
                    // Draw bottom pipe (normal) - extends below canvas
                    this.ctx.drawImage(
                        this.pipeImage, 
                        pipe.x, 
                        pipe.y, 
                        pipe.width, 
                        pipe.height
                    );
                }
            });
        } else {
            // Fallback: Draw pipes as pink rectangles if image not loaded
            this.ctx.fillStyle = '#FFB6C1';
            this.pipes.forEach(pipe => {
                this.ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
                // Debug: draw border to see exact boundaries
                this.ctx.strokeStyle = '#FF1493';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
            });
        }
        
        // Draw player (Cinnamoroll)
        this.drawCinnamoroll();
        
        // Draw UI
        this.drawUI();
    }
    
    drawClouds() {
        // Background decorative clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 150 + this.currentTime * 10) % (this.canvas.width + 100);
            const y = 50 + Math.sin(this.currentTime + i) * 20;
            this.drawCloud(x, y, 80, 40);
        }
    }
    
    drawCloud(x, y, width, height) {
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.25, y + height * 0.5, width * 0.25, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.5, y + height * 0.3, width * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.75, y + height * 0.5, width * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCinnamoroll() {
        // Update the animated overlay position
        this.updateAnimatedPlayerPosition();
        
        // Only draw fallback when not playing (menu, game over, etc.)
        if (!this.isPlaying) {
            // Draw the same image as fallback on canvas (static, mirrored)
            const x = this.player.x;
            const y = this.player.y;
            const width = this.player.width;
            const height = this.player.height;
            
            if (this.playerImageLoaded) {
                // Apply mirror effect to canvas drawing
                this.ctx.save();
                this.ctx.scale(-1, 1);
                
                // Draw the plane-cinnamoroll.gif image (static frame, mirrored)
                this.ctx.drawImage(
                    this.playerImage,
                    -(x + width), // Adjust x position for mirror effect
                    y,
                    width,
                    height
                );
                
                this.ctx.restore();
            } else {
                // Simple fallback if image not loaded
                this.ctx.save();
                this.ctx.scale(-1, 1);
                
                // Draw a simple circle as final fallback
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(-(x + width/2), y + height/2, width/3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add a pink border
                this.ctx.strokeStyle = '#FFB6C1';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                this.ctx.restore();
            }
        }
    }
    
    drawUI() {
        if (!this.isPlaying) return;
        
        // Timer
        const timeLeft = Math.max(0, this.survivalTime - this.currentTime);
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.font = 'bold 20px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Tiempo: ${Math.ceil(timeLeft)}s`, this.canvas.width / 2, 30);
        
        // Progress bar
        const progress = Math.min(this.currentTime / this.survivalTime, 1);
        const barWidth = 200;
        const barHeight = 10;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = 40;
        
        // Background
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#FF1493';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    startGame() {
        this.isPlaying = true;
        this.gameCompleted = false;
        this.startTime = Date.now();
        this.currentTime = 0;
        this.player.y = this.canvas.height / 2;
        this.player.velocity = 0;
        this.pipes = [];
        this.pipeTimer = 0;
        
        // Reset destination markers
        this.currentDestinationIndex = 0;
        if (this.destinationMarker) {
            this.destinationMarker.style.display = 'none';
        }
        
        document.getElementById('start-flappy-btn').style.display = 'none';
        document.getElementById('game-instructions').innerHTML = '<p>🎮 Presiona ESPACIO para volar</p>';
    }
    
    resetGame() {
        this.isPlaying = false;
        this.gameCompleted = false;
        
        // Hide animated player
        if (this.animatedPlayer) {
            this.animatedPlayer.style.display = 'none';
        }
        
        // Hide destination marker
        if (this.destinationMarker) {
            this.destinationMarker.style.display = 'none';
        }
        
        document.getElementById('start-flappy-btn').style.display = 'block';
        document.getElementById('start-flappy-btn').textContent = '¡Intentar de nuevo!';
        document.getElementById('game-instructions').innerHTML = '<p style="color: #ff69b4;">¡Oops! Cinnamoroll chocó con una tubería. ¡Inténtalo otra vez!</p>';
    }
    
    completeGame() {
        this.isPlaying = false;
        this.gameCompleted = true;
        
        // Hide animated player
        if (this.animatedPlayer) {
            this.animatedPlayer.style.display = 'none';
        }
        
        // Hide destination marker
        if (this.destinationMarker) {
            this.destinationMarker.style.display = 'none';
        }
        
        document.getElementById('next-adventure-btn').style.display = 'block';
        document.getElementById('game-instructions').innerHTML = '<p style="color: #32cd32;">¡Perfecto! ¡Cinnamoroll ha volado exitosamente!</p>';
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Game instance
let flappyGame = null;

function startFlappyGame() {
    if (!flappyGame) {
        flappyGame = new FlappyGame();
    }
    flappyGame.startGame();
}

function completeAdventure() {
    document.getElementById('adventure-step-2').classList.remove('active');
    document.getElementById('adventure-step-3').classList.add('active');
}

