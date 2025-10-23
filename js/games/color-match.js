// Color Match Game Implementation
class ColorMatchGame {
    constructor() {
        this.colors = [
            { name: 'RED', nameRu: 'КРАСНЫЙ', color: '#e74c3c' },
            { name: 'BLUE', nameRu: 'СИНИЙ', color: '#3498db' },
            { name: 'GREEN', nameRu: 'ЗЕЛЕНЫЙ', color: '#2ecc71' },
            { name: 'YELLOW', nameRu: 'ЖЕЛТЫЙ', color: '#f1c40f' },
            { name: 'PURPLE', nameRu: 'ФИОЛЕТОВЫЙ', color: '#9b59b6' },
            { name: 'ORANGE', nameRu: 'ОРАНЖЕВЫЙ', color: '#e67e22' }
        ];
        this.score = 0;
        this.timeLeft = 30;
        this.isPlaying = false;
        this.currentWord = null;
        this.currentTextColor = null;
        this.correctAnswer = null;
        this.gameTimer = null;
        this.questionType = null; // 'word' or 'color'
    }

    init() {
        this.score = 0;
        this.timeLeft = 30;
        this.isPlaying = false;

        const gameStats = stats.getStats().colorMatch || { highScore: 0, total: 0 };

        const content = `
            <div class="game-title-screen">🎨 Color Match</div>
            
            <div class="color-match-container">
                <div class="color-match-info">
                    <div class="color-match-timer" id="color-timer">⏱️ ${this.timeLeft}s</div>
                    <div class="color-match-score" id="color-score">Score: ${this.score}</div>
                </div>

                <div class="color-match-question" id="color-question-area">
                    <div class="color-question-label" id="question-label">What COLOR is the text?</div>
                    <div class="color-word-display" id="color-word">RED</div>
                </div>

                <div class="color-match-options" id="color-options"></div>

                <div class="color-match-start" id="color-start-screen">
                    <h3>How to Play:</h3>
                    <p>You'll see a color word.</p>
                    <p>Sometimes: "What COLOR is the text?"</p>
                    <p>Sometimes: "What does the WORD say?"</p>
                    <p><strong>Choose quickly!</strong></p>
                    <button class="game-btn" onclick="colorMatchGame.start()">Start Game</button>
                </div>
            </div>

            <div class="game-stats">
                <span>High Score: ${gameStats.highScore}</span>
                <span>Games: ${gameStats.total}</span>
            </div>
        `;

        document.getElementById('game-content').innerHTML = content;
    }

    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 30;

        // Hide start screen
        const startScreen = document.getElementById('color-start-screen');
        if (startScreen) startScreen.style.display = 'none';

        Utils.playSound('click');
        Utils.vibrate([50]);

        // Start timer
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();

            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);

        this.nextQuestion();
    }

    nextQuestion() {
        if (!this.isPlaying) return;

        // Random word and text color
        const wordColor = this.colors[Utils.getRandomInt(0, this.colors.length - 1)];
        const textColor = this.colors[Utils.getRandomInt(0, this.colors.length - 1)];

        this.currentWord = wordColor;
        this.currentTextColor = textColor;

        // Random question type
        this.questionType = Math.random() > 0.5 ? 'color' : 'word';

        // Set correct answer
        this.correctAnswer = this.questionType === 'color' ? textColor : wordColor;

        // Update display
        const wordDisplay = document.getElementById('color-word');
        const questionLabel = document.getElementById('question-label');

        if (wordDisplay) {
            wordDisplay.textContent = wordColor.nameRu;
            wordDisplay.style.color = textColor.color;
        }

        if (questionLabel) {
            questionLabel.textContent = this.questionType === 'color' 
                ? '🎨 What COLOR is the text?' 
                : '📝 What does the WORD say?';
        }

        // Generate options
        this.generateOptions();
    }

    generateOptions() {
        const optionsContainer = document.getElementById('color-options');
        if (!optionsContainer) return;

        // Shuffle colors
        const shuffled = [...this.colors].sort(() => Math.random() - 0.5);

        optionsContainer.innerHTML = shuffled.map(color => `
            <button class="color-option" 
                    style="background-color: ${color.color}; color: white;" 
                    onclick="colorMatchGame.checkAnswer('${color.name}')">
                ${color.nameRu}
            </button>
        `).join('');
    }

    checkAnswer(selectedColorName) {
        if (!this.isPlaying) return;

        const correct = selectedColorName === this.correctAnswer.name;

        if (correct) {
            this.score += 10;
            this.timeLeft += 2; // Bonus time!
            this.updateScore();
            Utils.playSound('success');
            Utils.vibrate([50]);

            // Visual feedback
            this.showFeedback(true);
        } else {
            this.timeLeft -= 3; // Penalty
            Utils.playSound('error');
            Utils.vibrate([100, 50, 100]);

            // Visual feedback
            this.showFeedback(false);
        }

        // Next question
        setTimeout(() => {
            this.nextQuestion();
        }, 500);
    }

    showFeedback(correct) {
        const questionArea = document.getElementById('color-question-area');
        if (!questionArea) return;

        questionArea.style.backgroundColor = correct 
            ? 'rgba(46, 204, 113, 0.3)' 
            : 'rgba(231, 76, 60, 0.3)';

        setTimeout(() => {
            questionArea.style.backgroundColor = '';
        }, 500);
    }

    updateScore() {
        const scoreEl = document.getElementById('color-score');
        if (scoreEl) {
            scoreEl.textContent = `Score: ${this.score}`;
        }
    }

    updateTimer() {
        const timerEl = document.getElementById('color-timer');
        if (timerEl) {
            timerEl.textContent = `⏱️ ${this.timeLeft}s`;
            
            // Warning colors
            if (this.timeLeft <= 5) {
                timerEl.style.color = '#e74c3c';
                timerEl.style.animation = 'pulse 0.5s infinite';
            } else if (this.timeLeft <= 10) {
                timerEl.style.color = '#f39c12';
            }
        }
    }

    gameOver() {
        this.isPlaying = false;

        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        Utils.playSound('error');
        Utils.vibrate([200]);

        // Update stats
        const currentStats = stats.getStats().colorMatch || { highScore: 0, total: 0 };
        if (this.score > currentStats.highScore) {
            stats.updateGameStats('colorMatch', 'win', { score: this.score });
        } else {
            stats.updateGameStats('colorMatch', 'loss', { score: this.score });
        }

        // Show game over
        const startScreen = document.getElementById('color-start-screen');
        if (startScreen) {
            startScreen.innerHTML = `
                <h2>🎮 Game Over!</h2>
                <div class="final-score">Final Score: ${this.score}</div>
                <div class="high-score">High Score: ${Math.max(this.score, currentStats.highScore)}</div>
                <button class="game-btn" onclick="colorMatchGame.start()">Play Again</button>
            `;
            startScreen.style.display = 'block';
        }
    }
}

// Global color match game instance
const colorMatchGame = new ColorMatchGame();

