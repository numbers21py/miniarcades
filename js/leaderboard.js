// Leaderboard Management
class Leaderboard {
    constructor() {
        this.scores = [];
        this.currentUser = null;
        this.load();
        this.initTelegram();
    }

    initTelegram() {
        // Initialize Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe?.user;
            
            if (user) {
                this.currentUser = {
                    id: user.id,
                    firstName: user.first_name || 'Player',
                    lastName: user.last_name || '',
                    username: user.username || null,
                    photoUrl: user.photo_url || null
                };
            } else {
                // Fallback for testing
                this.currentUser = {
                    id: Date.now(),
                    firstName: 'Guest',
                    lastName: '',
                    username: null,
                    photoUrl: null
                };
            }
        }
    }

    load() {
        const saved = Storage.load('microarcade_leaderboard', []);
        this.scores = saved;
    }

    save() {
        Storage.save('microarcade_leaderboard', this.scores);
    }

    submitScore(gameType, score, metadata = {}) {
        if (!this.currentUser) return;

        const entry = {
            userId: this.currentUser.id,
            userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
            username: this.currentUser.username,
            gameType: gameType,
            score: score,
            metadata: metadata,
            timestamp: Date.now()
        };

        this.scores.push(entry);
        this.save();

        // Share to Telegram if available
        this.shareScore(gameType, score);
    }

    getTopScores(gameType, limit = 10) {
        return this.scores
            .filter(entry => entry.gameType === gameType)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
    }

    getGlobalTopScores(limit = 10) {
        // Aggregate scores by user
        const userScores = {};
        
        this.scores.forEach(entry => {
            if (!userScores[entry.userId]) {
                userScores[entry.userId] = {
                    userId: entry.userId,
                    userName: entry.userName,
                    username: entry.username,
                    totalScore: 0,
                    gamesPlayed: 0
                };
            }
            userScores[entry.userId].totalScore += entry.score;
            userScores[entry.userId].gamesPlayed++;
        });

        return Object.values(userScores)
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, limit)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
    }

    getUserRank(gameType = null) {
        if (!this.currentUser) return null;

        const scores = gameType 
            ? this.getTopScores(gameType, 1000)
            : this.getGlobalTopScores(1000);

        const userEntry = scores.find(entry => entry.userId === this.currentUser.id);
        return userEntry ? userEntry.rank : null;
    }

    shareScore(gameType, score) {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const message = `🎮 I just scored ${score} in ${gameType} on MiniArcades! Can you beat me?`;
            
            // Try to share via Telegram
            if (tg.shareToStory) {
                tg.shareToStory(message);
            }
        }
    }

    displayLeaderboard(container, gameType = null) {
        const scores = gameType 
            ? this.getTopScores(gameType, 10)
            : this.getGlobalTopScores(10);

        const currentUserRank = this.getUserRank(gameType);

        let html = `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h2>🏆 Leaderboard</h2>
                    ${gameType ? `<p class="leaderboard-subtitle">${gameType}</p>` : '<p class="leaderboard-subtitle">Global Rankings</p>'}
                </div>
                
                ${this.currentUser && currentUserRank ? `
                    <div class="user-rank-card">
                        <div class="user-rank-info">
                            <span class="user-rank-position">#${currentUserRank}</span>
                            <span class="user-rank-name">Your Rank</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="leaderboard-list">
                    ${scores.length === 0 ? `
                        <div class="leaderboard-empty">
                            <p>No scores yet!</p>
                            <p>Be the first to play and set a record! 🎯</p>
                        </div>
                    ` : scores.map(entry => `
                        <div class="leaderboard-item ${entry.userId === this.currentUser?.id ? 'current-user' : ''}">
                            <div class="leaderboard-rank">
                                ${entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                            </div>
                            <div class="leaderboard-info">
                                <div class="leaderboard-name">${entry.userName}</div>
                                ${entry.username ? `<div class="leaderboard-username">@${entry.username}</div>` : ''}
                            </div>
                            <div class="leaderboard-score">${entry.score}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="leaderboard-actions">
                    <button class="game-btn game-btn-secondary" onclick="leaderboard.shareToTelegram()">📢 Share</button>
                    <button class="game-btn" onclick="app.showMainMenu()">Play More</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    shareToTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const rank = this.getUserRank();
            const message = rank 
                ? `🎮 I'm ranked #${rank} on MiniArcades! Join me and let's compete! 🏆`
                : `🎮 Join me on MiniArcades - quick games for instant fun! 🏆`;
            
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/miniarcades_bot')}&text=${encodeURIComponent(message)}`);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Global leaderboard instance
const leaderboard = new Leaderboard();

