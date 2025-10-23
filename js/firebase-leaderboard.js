// Firebase Leaderboard System
class FirebaseLeaderboard {
    constructor() {
        this.currentUser = null;
        this.useFirebase = typeof database !== 'undefined';
        this.init();
    }

    init() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe.user;
            
            if (user) {
                this.currentUser = {
                    id: user.id.toString(),
                    userName: user.username || user.first_name || 'Player',
                    firstName: user.first_name || 'Player',
                    photoUrl: user.photo_url || null
                };
            }
        }

        if (!this.currentUser) {
            this.currentUser = {
                id: 'local_' + Date.now(),
                userName: 'Guest',
                firstName: 'Guest',
                photoUrl: null
            };
        }
    }

    // Update user score
    async updateScore(gameType, score) {
        if (!this.useFirebase) {
            return this.updateScoreLocal(gameType, score);
        }

        try {
            const userRef = database.ref(`leaderboard/${gameType}/${this.currentUser.id}`);
            const snapshot = await userRef.once('value');
            const currentData = snapshot.val();

            const newScore = {
                userId: this.currentUser.id,
                userName: this.currentUser.userName,
                firstName: this.currentUser.firstName,
                photoUrl: this.currentUser.photoUrl,
                score: score,
                highScore: Math.max(score, currentData?.highScore || 0),
                gamesPlayed: (currentData?.gamesPlayed || 0) + 1,
                lastPlayed: Date.now()
            };

            await userRef.set(newScore);
            return true;
        } catch (error) {
            console.error('Update score error:', error);
            return this.updateScoreLocal(gameType, score);
        }
    }

    // Get top players
    async getTopPlayers(gameType, limit = 10) {
        if (!this.useFirebase) {
            return this.getTopPlayersLocal(gameType, limit);
        }

        try {
            const snapshot = await database.ref(`leaderboard/${gameType}`)
                .orderByChild('highScore')
                .limitToLast(limit)
                .once('value');

            const players = [];
            snapshot.forEach((child) => {
                players.unshift(child.val());
            });

            return players;
        } catch (error) {
            console.error('Get leaderboard error:', error);
            return this.getTopPlayersLocal(gameType, limit);
        }
    }

    // Get user rank
    async getUserRank(gameType) {
        if (!this.useFirebase) {
            return 1; // Local mode
        }

        try {
            const snapshot = await database.ref(`leaderboard/${gameType}`)
                .orderByChild('highScore')
                .once('value');

            let rank = 0;
            let userScore = 0;

            snapshot.forEach((child) => {
                const data = child.val();
                if (data.userId === this.currentUser.id) {
                    userScore = data.highScore;
                }
            });

            snapshot.forEach((child) => {
                const data = child.val();
                if (data.highScore > userScore) {
                    rank++;
                }
            });

            return rank + 1;
        } catch (error) {
            console.error('Get rank error:', error);
            return 1;
        }
    }

    // Display leaderboard
    async displayLeaderboard(gameType = 'overall') {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;

        const players = await this.getTopPlayers(gameType, 10);
        const userRank = await this.getUserRank(gameType);

        let html = `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h2>🏆 Leaderboard</h2>
                    <div class="leaderboard-mode">
                        <button class="mode-btn ${gameType === 'overall' ? 'active' : ''}" 
                                onclick="firebaseLeaderboard.displayLeaderboard('overall')">
                            Overall
                        </button>
                        <button class="mode-btn ${gameType === 'dice' ? 'active' : ''}" 
                                onclick="firebaseLeaderboard.displayLeaderboard('dice')">
                            Dice
                        </button>
                        <button class="mode-btn ${gameType === 'colorMatch' ? 'active' : ''}" 
                                onclick="firebaseLeaderboard.displayLeaderboard('colorMatch')">
                            Color Match
                        </button>
                    </div>
                </div>

                <div class="user-rank-card">
                    <span class="rank-badge">#{userRank}</span>
                    <div class="user-info">
                        <div class="user-name">${this.currentUser.firstName}</div>
                        <div class="user-score">Your Best: ${this.getLocalHighScore(gameType)}</div>
                    </div>
                </div>

                <div class="leaderboard-list">
        `;

        if (players.length === 0) {
            html += `
                <div class="no-scores">
                    <p>No scores yet!</p>
                    <p>Be the first to play and set a record! 🎯</p>
                </div>
            `;
        } else {
            players.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                html += `
                    <div class="leaderboard-item ${player.userId === this.currentUser.id ? 'current-user' : ''}">
                        <span class="rank">${medal || `#${index + 1}`}</span>
                        <div class="player-info">
                            <div class="player-name">${player.firstName}</div>
                            <div class="player-games">${player.gamesPlayed} games</div>
                        </div>
                        <span class="player-score">${player.highScore}</span>
                    </div>
                `;
            });
        }

        html += `
                </div>

                <div class="leaderboard-actions">
                    <button class="btn btn-primary" onclick="firebaseLeaderboard.shareScore('${gameType}')">
                        📢 Share Score
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Local fallback methods
    updateScoreLocal(gameType, score) {
        const key = `local_leaderboard_${gameType}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        
        const existingIndex = data.findIndex(p => p.userId === this.currentUser.id);
        if (existingIndex >= 0) {
            data[existingIndex].score = Math.max(data[existingIndex].score, score);
        } else {
            data.push({
                userId: this.currentUser.id,
                userName: this.currentUser.userName,
                firstName: this.currentUser.firstName,
                score: score,
                highScore: score
            });
        }

        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }

    getTopPlayersLocal(gameType, limit) {
        const key = `local_leaderboard_${gameType}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        return data.sort((a, b) => b.highScore - a.highScore).slice(0, limit);
    }

    getLocalHighScore(gameType) {
        const stats = JSON.parse(localStorage.getItem('microarcade_stats') || '{}');
        return stats[gameType]?.highScore || stats[gameType]?.bestScore || 0;
    }

    shareScore(gameType) {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const score = this.getLocalHighScore(gameType);
            const message = `🎮 I scored ${score} in ${gameType} on MiniArcades! Can you beat me?`;
            
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/miniarcades_bot')}&text=${encodeURIComponent(message)}`);
        }
    }
}

// Initialize
const firebaseLeaderboard = new FirebaseLeaderboard();

