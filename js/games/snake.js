// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.gameData = null;
        this.snake = [];
        this.food = {x: 0, y: 0};
        this.direction = 'right';
        this.gameLoop = null;
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
    }

    init() {
        const content = `
            <div class="game-title-screen">🐍 Snake</div>
            <div class="snake-container">
                <div class="snake-grid" id="snake-grid"></div>
            </div>
            <div class="game-stats">
                <span>Score: <span id="snake-score">0</span></span>
                <span>High: ${stats.getStats().snake.highScore}</span>
            </div>
            <div class="snake-controls">
                <div></div>
                <button class="snake-btn" onclick="snakeGame.changeDirection('up')">↑</button>
                <div></div>
                <button class="snake-btn" onclick="snakeGame.changeDirection('left')">←</button>
                <button class="snake-btn" onclick="snakeGame.togglePause()">⏸️</button>
                <button class="snake-btn" onclick="snakeGame.changeDirection('right')">→</button>
                <div></div>
                <button class="snake-btn" onclick="snakeGame.changeDirection('down')">↓</button>
                <div></div>
            </div>
            <button class="game-btn" onclick="snakeGame.start()" id="start-snake-btn">Start Game</button>
        `;
        
        document.getElementById('game-content').innerHTML = content;
    }

    start() {
        if (this.gameLoop) return;
        
        const grid = document.getElementById('snake-grid');
        grid.innerHTML = '';
        
        // Create grid cells
        for (let i = 0; i < 400; i++) {
            const cell = Utils.createElement('div', 'snake-cell');
            cell.id = `cell-${i}`;
            grid.appendChild(cell);
        }
        
        this.snake = [{x: 10, y: 10}];
        this.food = {x: 15, y: 15};
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        
        document.getElementById('start-snake-btn').textContent = 'Restart';
        this.updateDisplay();
        this.gameLoop = setInterval(() => this.update(), 150);
        
        Utils.playSound('click');
    }

    changeDirection(newDirection) {
        if (this.paused || this.gameOver) return;
        
        const opposites = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };
        
        if (opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
            Utils.vibrate([50]);
        }
    }

    togglePause() {
        this.paused = !this.paused;
        Utils.vibrate([50]);
    }

    update() {
        if (this.gameOver || this.paused) return;
        
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check boundaries
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            this.endGame();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            document.getElementById('snake-score').textContent = this.score;
            this.generateFood();
            Utils.playSound('success');
            Utils.vibrate([100, 50, 100]);
        } else {
            this.snake.pop();
        }
        
        this.updateDisplay();
    }

    generateFood() {
        do {
            this.food = {
                x: Utils.getRandomInt(0, 19),
                y: Utils.getRandomInt(0, 19)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y
        ));
    }

    updateDisplay() {
        // Clear grid
        document.querySelectorAll('.snake-cell').forEach(cell => {
            cell.className = 'snake-cell';
        });
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            const cellId = `cell-${segment.y * 20 + segment.x}`;
            const cell = document.getElementById(cellId);
            if (cell) {
                cell.classList.add(index === 0 ? 'snake-head' : 'snake-body');
            }
        });
        
        // Draw food
        const foodCellId = `cell-${this.food.y * 20 + this.food.x}`;
        const foodCell = document.getElementById(foodCellId);
        if (foodCell) {
            foodCell.classList.add('snake-food');
        }
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        stats.updateGameStats('snake', 'completed', { 
            score: this.score, 
            length: this.snake.length 
        });
        
        Utils.playSound('error');
        Utils.vibrate([200, 100, 200]);
        this.showResult();
    }

    showResult() {
        const gameStats = stats.getStats().snake;
        const content = `
            <div class="result-icon">🐍</div>
            <div class="result-title">Game Over!</div>
            <div class="result-stats">
                <div class="stat-item">
                    <span class="stat-label">Score:</span>
                    <span class="stat-value">${this.score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Length:</span>
                    <span class="stat-value">${this.snake.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">High Score:</span>
                    <span class="stat-value">${gameStats.highScore}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Best Length:</span>
                    <span class="stat-value">${gameStats.bestLength}</span>
                </div>
            </div>
        `;
        
        document.getElementById('result-content').innerHTML = content;
        app.showResultScreen();
    }
}

// Global snake game instance
const snakeGame = new SnakeGame();
