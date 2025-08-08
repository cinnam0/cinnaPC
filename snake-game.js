// Kawaii Pixel Snake Game
// Inspired by classic Snake, themed to match the site's pastel pixel aesthetic.
// Features: smooth step timing, heart/fruit candies, particle pops, pause, persistent best score.

class KawaiiSnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas?.getContext('2d');
        this.active = false;
        this.gridSize = 24; // base size for pixel feel
        this.cell = 20; // pixel size per cell
        this.cols = Math.floor(this.canvas.width / this.cell);
        this.rows = Math.floor(this.canvas.height / this.cell);
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.food = null;
        this.score = 0;
    this.best = parseInt(localStorage.getItem('snakeBestScore') || '0', 10);
        this.speed = 150; // ms per step
        this.minSpeed = 70;
        this.speedDecreaseEvery = 5; // increase speed every N foods
        this.lastStep = 0;
        this.isPaused = false;
        this.gameOver = false;
        this.particles = [];
        this.wrap = false; // can add toggle later
        this.colors = {
            bgTop: '#ffeef7',
            bgBottom: '#ffd6ec',
            grid: 'rgba(255,182,193,0.35)',
            snakeHead: '#ff69b4',
            snakeBody: '#ff9fcf',
            snakeOutline: '#ff1493',
            candyBody: '#ffde59',      // amarillo contrastado
            candyStripe: '#ff3d96',    // franja rosa fuerte
            heart: '#ff3d96',          // corazón intenso
            star: '#a6f7e6',           // estrella menta
            starOutline: '#33b8a8'
        };
        this.initControls();
        this.updateBestUI();
    }

    initControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.active) return;
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
                return;
            }
            const map = {
                ArrowUp: { x: 0, y: -1 },
                ArrowDown: { x: 0, y: 1 },
                ArrowLeft: { x: -1, y: 0 },
                ArrowRight: { x: 1, y: 0 },
                w: { x: 0, y: -1 },
                s: { x: 0, y: 1 },
                a: { x: -1, y: 0 },
                d: { x: 1, y: 0 }
            };
            const nd = map[e.key];
            if (nd) {
                // Prevent reversing into itself
                if (nd.x === -this.direction.x && nd.y === -this.direction.y) return;
                this.nextDir = nd;
            }
        });
    }

    start() {
        this.reset();
        this.active = true;
        this.gameLoop(performance.now());
    }

    reset() {
        this.snake = [
            { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) },
            { x: Math.floor(this.cols / 2) - 1, y: Math.floor(this.rows / 2) },
            { x: Math.floor(this.cols / 2) - 2, y: Math.floor(this.rows / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.spawnFood();
        this.score = 0;
        this.speed = 150;
        this.lastStep = 0;
        this.isPaused = false;
        this.gameOver = false;
        this.particles = [];
        this.updateScoreUI();
        this.updateBestUI();
    document.getElementById('snake-restart-btn').style.display = 'none';
    }

    togglePause() {
        if (this.gameOver) return;
        this.isPaused = !this.isPaused;
        const instr = document.querySelector('#snake-ui .snake-instructions');
    if (instr) instr.textContent = this.isPaused ? 'PAUSA · Pulsa P para continuar' : 'Usa W A S D o flechas · P pausa';
    }

    spawnFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.cols);
            y = Math.floor(Math.random() * this.rows);
        } while (this.snake.some(s => s.x === x && s.y === y));
    this.food = { x, y, kind: Math.random() < 0.6 ? 'candy' : (Math.random() < 0.5 ? 'heart' : 'star') };
    }

    gameLoop(ts) {
        if (!this.active) return;
        const delta = ts - this.lastStep;
        if (!this.isPaused && !this.gameOver && delta >= this.speed) {
            this.step();
            this.lastStep = ts;
        }
        this.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    step() {
        this.direction = this.nextDir;
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
        // Bounds
        if (this.wrap) {
            if (head.x < 0) head.x = this.cols - 1;
            if (head.x >= this.cols) head.x = 0;
            if (head.y < 0) head.y = this.rows - 1;
            if (head.y >= this.rows) head.y = 0;
        } else {
            if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
                return this.endGame();
            }
        }
        // Self collision
        if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            return this.endGame();
        }
    this.snake.unshift(head);
    this.playMoveTick();
        // Food
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            if (this.score > this.best) {
                this.best = this.score;
                localStorage.setItem('snakeBestScore', this.best);
            }
            // Particles pop
            this.spawnPop(head.x, head.y);
            this.spawnFood();
            if (this.score % this.speedDecreaseEvery === 0) {
                this.speed = Math.max(this.minSpeed, this.speed - 10);
            }
            this.updateScoreUI();
            this.updateBestUI();
            // endless mode only; no completion check
            this.playEat();
        } else {
            this.snake.pop();
        }
    }

    endGame() {
    this.gameOver = true;
    document.getElementById('snake-restart-btn').style.display = 'inline-block';
    const instr = document.querySelector('#snake-ui .snake-instructions');
    this.playGameOver();
    }

    updateScoreUI() { document.getElementById('snake-score').textContent = `Puntos: ${this.score}`; }
    updateBestUI() { document.getElementById('snake-best').textContent = `Récord: ${this.best}`; }
    // removed target UI for endless mode

    draw() {
        if (!this.ctx) return;
        // Gradient background
        const g = this.ctx.createLinearGradient(0,0,0,this.canvas.height);
        g.addColorStop(0,this.colors.bgTop);
        g.addColorStop(1,this.colors.bgBottom);
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        this.drawGrid();
        this.drawFood();
        this.drawSnake();
        this.updateParticles();
        this.drawParticles();

        if (this.isPaused && !this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.35)';
            this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
            this.ctx.fillStyle = '#ff1493';
            this.ctx.font = 'bold 24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSA', this.canvas.width/2, this.canvas.height/2);
        }
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        for (let x=0; x<=this.cols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cell + 0.5, 0);
            ctx.lineTo(x * this.cell + 0.5, this.rows * this.cell);
            ctx.stroke();
        }
        for (let y=0; y<=this.rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cell + 0.5);
            ctx.lineTo(this.cols * this.cell, y * this.cell + 0.5);
            ctx.stroke();
        }
    }

    drawSnake() {
        const ctx = this.ctx;
        for (let i=0; i<this.snake.length; i++) {
            const seg = this.snake[i];
            const x = seg.x * this.cell;
            const y = seg.y * this.cell;
            ctx.fillStyle = i === 0 ? this.colors.snakeHead : this.colors.snakeBody;
            ctx.fillRect(x+1,y+1,this.cell-2,this.cell-2);
            ctx.strokeStyle = this.colors.snakeOutline;
            ctx.lineWidth = 1;
            ctx.strokeRect(x+0.5,y+0.5,this.cell-1,this.cell-1);
            if (i === 0) {
                // Eyes kawaii
                ctx.fillStyle = '#fff';
                const eyeSize = 4;
                ctx.fillRect(x + this.cell/2 - 6, y + 6, eyeSize, eyeSize);
                ctx.fillRect(x + this.cell/2 + 2, y + 6, eyeSize, eyeSize);
                ctx.fillStyle = '#000';
                ctx.fillRect(x + this.cell/2 - 5, y + 7, 2,2);
                ctx.fillRect(x + this.cell/2 + 3, y + 7, 2,2);
                // blush
                ctx.fillStyle = '#ffb6c1';
                ctx.fillRect(x + 4, y + this.cell - 8, 3,3);
                ctx.fillRect(x + this.cell - 7, y + this.cell - 8, 3,3);
            }
        }
    }

    drawFood() {
        if (!this.food) return;
        const ctx = this.ctx;
        const { x, y, kind } = this.food;
        const px = x * this.cell;
        const py = y * this.cell;
        if (kind === 'candy') {
            ctx.save();
            ctx.fillStyle = this.colors.candyBody;
            ctx.fillRect(px+3, py+5, this.cell-6, this.cell-10);
            ctx.fillStyle = this.colors.candyStripe;
            ctx.fillRect(px+3, py+10, this.cell-6, 4);
            ctx.strokeStyle = '#d18a00';
            ctx.lineWidth = 1;
            ctx.strokeRect(px+3.5, py+5.5, this.cell-7, this.cell-11);
            ctx.restore();
        } else if (kind === 'heart') {
            ctx.save();
            ctx.fillStyle = this.colors.heart;
            this.drawHeart(px + this.cell/2, py + this.cell/2, this.cell/2 - 3);
            ctx.strokeStyle = '#b01055';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        } else { // star
            ctx.save();
            ctx.fillStyle = this.colors.star;
            this.drawStar(px + this.cell/2, py + this.cell/2, this.cell/2 - 3, 5);
            ctx.strokeStyle = this.colors.starOutline;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    }

    drawHeart(cx, cy, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(cx, cy + r/4);
        ctx.bezierCurveTo(cx + r, cy - r/2, cx + r*1.4, cy + r/2, cx, cy + r);
        ctx.bezierCurveTo(cx - r*1.4, cy + r/2, cx - r, cy - r/2, cx, cy + r/4);
        ctx.fill();
    }

    drawStar(cx, cy, outer, points) {
        const ctx = this.ctx;
        const inner = outer/2.8;
        ctx.beginPath();
        for (let i=0; i<points*2; i++) {
            const angle = (Math.PI / points) * i;
            const r = i % 2 === 0 ? outer : inner;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.fill();
    }

    spawnPop(gx, gy) {
        for (let i=0;i<8;i++) {
            this.particles.push({
                x: gx * this.cell + this.cell/2,
                y: gy * this.cell + this.cell/2,
                vx: (Math.random()-0.5)*2.2,
                vy: (Math.random()-0.5)*2.2,
                life: 500 + Math.random()*300,
                born: performance.now(),
                color: ['#ff69b4','#ff1493','#ffc1e3','#ff8ac2'][Math.floor(Math.random()*4)]
            });
        }
    }

    updateParticles() {
        const now = performance.now();
        this.particles = this.particles.filter(p => (now - p.born) < p.life).map(p => {
            p.x += p.vx;
            p.y += p.vy;
            return p;
        });
    }

    drawParticles() {
        const ctx = this.ctx;
        this.particles.forEach(p => {
            const age = (performance.now() - p.born) / p.life;
            ctx.globalAlpha = 1 - age;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - 2, p.y - 2, 4,4);
            ctx.globalAlpha = 1;
        });
    }
}

// Global control wrappers (integrate with existing pattern)
let kawaiiSnake = null;
function startSnakeGameIntro() {
    document.getElementById('snake-step-1').classList.remove('active');
    document.getElementById('snake-step-2').classList.add('active');
}
function startSnakeGame() {
    if (!kawaiiSnake) kawaiiSnake = new KawaiiSnakeGame();
    kawaiiSnake.start();
    document.getElementById('snake-start-btn').style.display = 'none';
}
function restartSnakeGame() {
    if (kawaiiSnake) {
        kawaiiSnake.reset();
        document.getElementById('snake-start-btn').style.display = 'none';
    }
}
function finishSnakeAdventure() { /* removed final step in endless mode */ }

// Window open/close helpers
function openSnakeAdventure() {
    const list = document.getElementById('email-selection-container');
    if (list) list.style.display = 'none';
    const c = document.getElementById('snake-adventure-container');
    if (c) {
        c.style.display = 'block';
        const retroBar = document.getElementById('retro-bar');
        const retroBarHeight = retroBar ? retroBar.offsetHeight : 0;
        c.style.top = (retroBarHeight + 20) + 'px';
        c.style.left = Math.max(0, (window.innerWidth - c.offsetWidth) / 2) + 'px';
    }
}
function closeSnakeAdventure() {
    const c = document.getElementById('snake-adventure-container');
    if (c) c.style.display = 'none';
}

// --- Sound synthesis (simple Web Audio beeps) ---
KawaiiSnakeGame.prototype.getAudioCtx = function() {
    if (!this._audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this._audioCtx = new AC();
    }
    return this._audioCtx;
};

KawaiiSnakeGame.prototype.playTone = function(freq, duration=120, type='sine', volume=0.15) {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration/1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration/1000);
};

KawaiiSnakeGame.prototype.playEat = function() {
    // two quick twinkles
    this.playTone(880,90,'square',0.18);
    setTimeout(()=>this.playTone(1320,70,'square',0.14),50);
};

KawaiiSnakeGame.prototype.playMoveTick = function() {
    // subtle low click every move (optional throttle)
    if (!this._lastTickSound || performance.now() - this._lastTickSound > 180) {
        this.playTone(220,40,'triangle',0.05);
        this._lastTickSound = performance.now();
    }
};

KawaiiSnakeGame.prototype.playGameOver = function() {
    this.playTone(300,180,'sawtooth',0.2);
    setTimeout(()=>this.playTone(180,260,'sawtooth',0.15),140);
};

Object.assign(window, { openSnakeAdventure, startSnakeGameIntro, startSnakeGame, restartSnakeGame, finishSnakeAdventure, closeSnakeAdventure });
