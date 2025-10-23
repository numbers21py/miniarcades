// Statistics Management
class Stats {
    constructor() {
        this.stats = {
            dice: { wins: 0, losses: 0, total: 0, winStreak: 0, bestStreak: 0 },
            rps: { wins: 0, losses: 0, total: 0, winStreak: 0, bestStreak: 0 },
            reaction: { bestTime: null, attempts: 0, total: 0, averageTime: 0 },
            memory: { wins: 0, losses: 0, total: 0, bestTime: null, bestScore: 0 },
            snake: { highScore: 0, total: 0, bestLength: 0 },
            ticTacToe: { wins: 0, losses: 0, total: 0, draws: 0 },
            slots: { total: 0, wins: 0, bestWin: 0 },
            colorMatch: { highScore: 0, total: 0 }
        };
        this.load();
    }

    load() {
        const saved = Storage.load('microarcade_stats', this.stats);
        this.stats = { ...this.stats, ...saved };
    }

    save() {
        Storage.save('microarcade_stats', this.stats);
    }

    updateGameStats(gameType, result, data = {}) {
        if (!this.stats[gameType]) return;

        this.stats[gameType].total++;
        
        switch(gameType) {
            case 'dice':
                if (result === 'win') {
                    this.stats.dice.wins++;
                    this.stats.dice.winStreak++;
                    if (this.stats.dice.winStreak > this.stats.dice.bestStreak) {
                        this.stats.dice.bestStreak = this.stats.dice.winStreak;
                    }
                } else if (result === 'loss') {
                    this.stats.dice.losses++;
                    this.stats.dice.winStreak = 0;
                } else if (result === 'tie') {
                    this.stats.dice.winStreak = 0;
                }
                break;
                
            case 'rps':
                if (result === 'win') {
                    this.stats.rps.wins++;
                    this.stats.rps.winStreak++;
                    if (this.stats.rps.winStreak > this.stats.rps.bestStreak) {
                        this.stats.rps.bestStreak = this.stats.rps.winStreak;
                    }
                } else if (result === 'loss') {
                    this.stats.rps.losses++;
                    this.stats.rps.winStreak = 0;
                }
                break;
                
            case 'reaction':
                if (data.time) {
                    if (!this.stats.reaction.bestTime || data.time < this.stats.reaction.bestTime) {
                        this.stats.reaction.bestTime = data.time;
                    }
                    this.stats.reaction.attempts++;
                    this.updateAverageTime(data.time);
                }
                break;
                
            case 'memory':
                if (result === 'win') {
                    this.stats.memory.wins++;
                    if (data.moves < this.stats.memory.bestScore || this.stats.memory.bestScore === 0) {
                        this.stats.memory.bestScore = data.moves;
                    }
                } else if (result === 'loss') {
                    this.stats.memory.losses++;
                }
                break;
                
            case 'snake':
                if (data.score > this.stats.snake.highScore) {
                    this.stats.snake.highScore = data.score;
                }
                if (data.length > this.stats.snake.bestLength) {
                    this.stats.snake.bestLength = data.length;
                }
                break;
                
            case 'ticTacToe':
                if (result === 'win') {
                    this.stats.ticTacToe.wins++;
                } else if (result === 'loss') {
                    this.stats.ticTacToe.losses++;
                } else if (result === 'draw') {
                    this.stats.ticTacToe.draws++;
                }
                break;
                
            case 'slots':
                if (result === 'win') {
                    this.stats.slots.wins++;
                    if (data.win > this.stats.slots.bestWin) {
                        this.stats.slots.bestWin = data.win;
                    }
                }
                break;
                
            case 'colorMatch':
                if (data.score > this.stats.colorMatch.highScore) {
                    this.stats.colorMatch.highScore = data.score;
                }
                break;
        }
        
        this.save();
        this.updateDisplay();
    }

    updateAverageTime(time) {
        const totalTime = this.stats.reaction.averageTime * (this.stats.reaction.attempts - 1) + time;
        this.stats.reaction.averageTime = totalTime / this.stats.reaction.attempts;
    }

    updateDisplay() {
        const totalGames = Object.values(this.stats).reduce((sum, game) => sum + (game.total || 0), 0);
        const totalWins = this.stats.dice.wins + this.stats.rps.wins + this.stats.memory.wins + this.stats.ticTacToe.wins;
        const bestReaction = this.stats.reaction.bestTime ? this.stats.reaction.bestTime + 'ms' : 'N/A';
        
        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('total-wins').textContent = totalWins;
        document.getElementById('best-reaction').textContent = bestReaction;
    }

    getDetailedStats() {
        return `
            <div class="stat-item">
                <span class="stat-label">🎲 Dice Games:</span>
                <span class="stat-value">${this.stats.dice.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Wins:</span>
                <span class="stat-value">${this.stats.dice.wins}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Roll:</span>
                <span class="stat-value">${this.stats.dice.bestRoll}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">✂️ RPS Games:</span>
                <span class="stat-value">${this.stats.rps.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Win Streak:</span>
                <span class="stat-value">${this.stats.rps.bestStreak}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">⏱️ Reaction Tests:</span>
                <span class="stat-value">${this.stats.reaction.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Time:</span>
                <span class="stat-value">${this.stats.reaction.bestTime ? this.stats.reaction.bestTime + 'ms' : 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">🧠 Memory Games:</span>
                <span class="stat-value">${this.stats.memory.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${this.stats.memory.bestScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">🐍 Snake High Score:</span>
                <span class="stat-value">${this.stats.snake.highScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">❌ Tic Tac Toe:</span>
                <span class="stat-value">${this.stats.ticTacToe.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">🎰 Slots:</span>
                <span class="stat-value">${this.stats.slots.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Win:</span>
                <span class="stat-value">${this.stats.slots.bestWin}x</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">🎨 Color Match:</span>
                <span class="stat-value">${this.stats.colorMatch.total}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">High Score:</span>
                <span class="stat-value">${this.stats.colorMatch.highScore}</span>
            </div>
        `;
    }

    reset() {
        this.stats = {
            dice: { wins: 0, losses: 0, total: 0, winStreak: 0, bestStreak: 0 },
            rps: { wins: 0, losses: 0, total: 0, winStreak: 0, bestStreak: 0 },
            reaction: { bestTime: null, attempts: 0, total: 0, averageTime: 0 },
            memory: { wins: 0, losses: 0, total: 0, bestTime: null, bestScore: 0 },
            snake: { highScore: 0, total: 0, bestLength: 0 },
            ticTacToe: { wins: 0, losses: 0, total: 0, draws: 0 },
            slots: { total: 0, wins: 0, bestWin: 0 },
            colorMatch: { highScore: 0, total: 0 }
        };
        this.save();
        this.updateDisplay();
    }

    getStats() {
        return this.stats;
    }
}

// Global stats instance
const stats = new Stats();
