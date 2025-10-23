// Simple Leaderboard System (LocalStorage + Sharing)
class SimpleLeaderboard {
    constructor() {
        this.currentUser = null;
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
                    lastName: user.last_name || '',
                    photoUrl: user.photo_url || null
                };
            }
        }

        if (!this.currentUser) {
            this.currentUser = {
                id: 'local_' + Date.now(),
                userName: 'Guest',
                firstName: 'Guest',
                lastName: '',
                photoUrl: null
            };
        }
    }

    // Update user score
    updateScore(gameType, score) {
        const key = `leaderboard_${gameType}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        
        const existingIndex = data.findIndex(p => p.userId === this.currentUser.id);
        if (existingIndex >= 0) {
            data[existingIndex].highScore = Math.max(data[existingIndex].highScore, score);
            data[existingIndex].gamesPlayed = (data[existingIndex].gamesPlayed || 0) + 1;
            data[existingIndex].lastPlayed = Date.now();
            // Update user info
            data[existingIndex].userName = this.currentUser.userName;
            data[existingIndex].firstName = this.currentUser.firstName;
            data[existingIndex].lastName = this.currentUser.lastName;
            data[existingIndex].photoUrl = this.currentUser.photoUrl;
        } else {
            data.push({
                userId: this.currentUser.id,
                userName: this.currentUser.userName,
                firstName: this.currentUser.firstName,
                lastName: this.currentUser.lastName,
                photoUrl: this.currentUser.photoUrl,
                highScore: score,
                gamesPlayed: 1,
                lastPlayed: Date.now()
            });
        }

        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }

    // Get top players
    getTopPlayers(gameType, limit = 10) {
        const key = `leaderboard_${gameType}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        return data.sort((a, b) => b.highScore - a.highScore).slice(0, limit);
    }

    // Get user rank
    getUserRank(gameType) {
        const players = this.getTopPlayers(gameType, 100);
        const userIndex = players.findIndex(p => p.userId === this.currentUser.id);
        return userIndex >= 0 ? userIndex + 1 : 1;
    }

    // Display leaderboard
    displayLeaderboard(gameType = 'overall') {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;

        const players = this.getTopPlayers(gameType, 10);
        const userRank = this.getUserRank(gameType);
        const userHighScore = this.getLocalHighScore(gameType);

        let html = `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h2>🏆 Leaderboard</h2>
                    <div class="leaderboard-mode">
                        <button class="mode-btn ${gameType === 'overall' ? 'active' : ''}" 
                                onclick="leaderboard.displayLeaderboard('overall')">
                            Overall
                        </button>
                        <button class="mode-btn ${gameType === 'dice' ? 'active' : ''}" 
                                onclick="leaderboard.displayLeaderboard('dice')">
                            Dice
                        </button>
                        <button class="mode-btn ${gameType === 'colorMatch' ? 'active' : ''}" 
                                onclick="leaderboard.displayLeaderboard('colorMatch')">
                            Color Match
                        </button>
                    </div>
                </div>

                <div class="user-rank-card">
                    <span class="rank-badge">#${userRank}</span>
                    <div class="user-info">
                        <div class="user-name">${this.currentUser.userName ? '@' + this.currentUser.userName : this.currentUser.firstName}</div>
                        <div class="user-score">Your Best: ${userHighScore}</div>
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
                const isCurrentUser = player.userId === this.currentUser.id;
                html += `
                    <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                        <span class="rank">${medal || `#${index + 1}`}</span>
                        <div class="player-info">
                            <div class="player-name">${player.userName ? '@' + player.userName : player.firstName}</div>
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
                    <button class="btn btn-primary" onclick="leaderboard.shareScore('${gameType}')">
                        📢 Share Score
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Get local high score
    getLocalHighScore(gameType) {
        const stats = JSON.parse(localStorage.getItem('microarcade_stats') || '{}');
        return stats[gameType]?.highScore || stats[gameType]?.bestScore || 0;
    }

    // Share score
    shareScore(gameType) {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const score = this.getLocalHighScore(gameType);
            const rank = this.getUserRank(gameType);
            const message = rank 
                ? `🎮 I'm ranked #${rank} on MiniArcades! Join me and let's compete! 🏆`
                : `🎮 Join me on MiniArcades - quick games for instant fun! 🏆`;
            
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/miniarcades_bot')}&text=${encodeURIComponent(message)}`);
        } else {
            const score = this.getLocalHighScore(gameType);
            const shareText = `I scored ${score} in ${gameType} on MiniArcades! Can you beat me?\n\nPlay at: https://t.me/miniarcades_bot`;
            
            if (navigator.share) {
                navigator.share({ text: shareText });
            } else {
                navigator.clipboard.writeText(shareText);
                alert('Share text copied to clipboard!');
            }
        }
    }
}

// Initialize
const leaderboard = new SimpleLeaderboard();
