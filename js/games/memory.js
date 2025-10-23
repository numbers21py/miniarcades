// Memory Game Implementation
class MemoryGame {
    constructor() {
        this.gameData = null;
        this.symbols = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍑', '🥝', '🍒'];
        this.flippedCards = [];
        this.matches = 0;
        this.moves = 0;
        this.startTime = null;
    }

    init() {
        const gameSymbols = Utils.shuffleArray([...this.symbols, ...this.symbols]);
        this.flippedCards = [];
        this.matches = 0;
        this.moves = 0;
        this.startTime = Date.now();
        
        const content = `
            <div class="game-title-screen">🧠 Memory Match</div>
            <div class="memory-grid" id="memory-grid"></div>
            <div class="game-stats">
                <span>Matches: <span id="matches">0</span>/8</span>
                <span>Moves: <span id="moves">0</span></span>
            </div>
            <button class="game-btn" onclick="memoryGame.init()">New Game</button>
        `;
        
        document.getElementById('game-content').innerHTML = content;
        
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';
        
        gameSymbols.forEach((symbol, index) => {
            const card = Utils.createElement('div', 'memory-card', '?');
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            card.onclick = () => this.flipCard(card, symbol, index);
            grid.appendChild(card);
        });
    }

    flipCard(card, symbol, index) {
        if (this.flippedCards.length >= 2 || card.classList.contains('flipped')) return;
        
        card.classList.add('flipped');
        card.innerHTML = symbol;
        this.flippedCards.push({card, symbol, index});
        
        Utils.playSound('click');
        Utils.vibrate([50]);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById('moves').textContent = this.moves;
            
            setTimeout(() => {
                if (this.flippedCards[0].symbol === this.flippedCards[1].symbol) {
                    this.flippedCards.forEach(({card}) => {
                        card.classList.add('matched');
                    });
                    this.matches++;
                    document.getElementById('matches').textContent = this.matches;
                    
                    Utils.playSound('success');
                    Utils.vibrate([100, 50, 100]);
                    
                    if (this.matches === 8) {
                        const gameTime = Date.now() - this.startTime;
                        stats.updateGameStats('memory', 'win', { 
                            moves: this.moves, 
                            time: gameTime 
                        });
                        this.showResult(true, this.moves, gameTime);
                    }
                } else {
                    this.flippedCards.forEach(({card}) => {
                        card.classList.remove('flipped');
                        card.innerHTML = '?';
                    });
                    Utils.playSound('error');
                    Utils.vibrate([200]);
                }
                this.flippedCards = [];
            }, 1000);
        }
    }

    showResult(won, moves, time) {
        const gameStats = stats.getStats().memory;
        const content = `
            <div class="result-icon">${won ? '🎉' : '😔'}</div>
            <div class="result-title">${won ? 'Memory Master!' : 'Try Again!'}</div>
            <div class="result-stats">
                <div class="stat-item">
                    <span class="stat-label">Moves:</span>
                    <span class="stat-value">${moves}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Time:</span>
                    <span class="stat-value">${Math.round(time / 1000)}s</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Best Score:</span>
                    <span class="stat-value">${gameStats.bestScore}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Games Won:</span>
                    <span class="stat-value">${gameStats.wins}</span>
                </div>
            </div>
        `;
        
        document.getElementById('result-content').innerHTML = content;
        app.showResultScreen();
    }
}

// Global memory game instance
const memoryGame = new MemoryGame();
