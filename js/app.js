// Main Application
class App {
    constructor() {
        this.currentGame = null;
        this.games = {
            dice: diceGame,
            rps: rpsGame,
            reaction: reactionGame,
            memory: memoryGame,
            snake: snakeGame,
            'tic-tac-toe': ticTacToeGame,
            slots: slotsGame,
            'color-match': colorMatchGame
        };
        this.init();
    }

    init() {
        // Initialize Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }


        // Show main menu
        this.showMainMenu();

        // Update stats display
        stats.updateDisplay();
    }

    showMainMenu() {
        Utils.showScreen('main-menu');
        this.currentGame = null;
        this.updateGameGrid();
        stats.updateDisplay();
    }

    showGameScreen() {
        Utils.showScreen('game-screen');
    }

    showResultScreen() {
        Utils.showScreen('result-screen');
    }

    showSettings() {
        Utils.showScreen('settings-screen');
    }

    showStats() {
        Utils.showScreen('stats-screen');
        document.getElementById('detailed-stats').innerHTML = stats.getDetailedStats();
    }

    showLeaderboard() {
        Utils.showScreen('leaderboard-screen');
        const container = document.getElementById('leaderboard-content');
        leaderboard.displayLeaderboard(container);
    }

    inviteFriends() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const message = '🎮 Join me on MiniArcades - quick games for instant fun! 🏆';
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent('https://t.me/miniarcades_bot')}&text=${encodeURIComponent(message)}`);
        } else {
            alert('Share: Join me on MiniArcades! 🎮');
        }
    }

    startGame(gameType, isMultiplayer = false) {
        this.currentGame = gameType;
        
        if (isMultiplayer) {
            this.showMultiplayerLobby(gameType);
        } else {
            this.showGameScreen();
            
            if (this.games[gameType]) {
                this.games[gameType].init();
            }
        }
        
        Utils.playSound('click');
        Utils.vibrate([50]);
    }

    showMultiplayerLobby(gameType) {
        Utils.showScreen('multiplayer-lobby');
        const container = document.getElementById('multiplayer-content');
        
        const content = `
            <div class="multiplayer-container">
                <div class="multiplayer-header">
                    <h2>🎮 Multiplayer</h2>
                    <p class="game-type-label">${gameType}</p>
                </div>

                <div class="multiplayer-options">
                    <button class="game-btn" onclick="app.createMultiplayerRoom('${gameType}')">
                        🎯 Create Room
                    </button>
                    <button class="game-btn game-btn-secondary" onclick="app.showJoinRoom('${gameType}')">
                        🔍 Join Room
                    </button>
                </div>

                <div class="multiplayer-rooms">
                    <h3>Available Rooms</h3>
                    <div id="rooms-container"></div>
                </div>
            </div>
        `;

        container.innerHTML = content;
        this.updateRoomsList(gameType);
        
        if (this.roomsInterval) clearInterval(this.roomsInterval);
        this.roomsInterval = setInterval(() => {
            this.updateRoomsList(gameType);
        }, 2000);
    }

    createMultiplayerRoom(gameType) {
        const roomId = multiplayer.createRoom(gameType);
        this.showWaitingRoom(gameType, roomId);
    }

    showJoinRoom(gameType) {
        const roomId = prompt('Enter Room ID:');
        if (!roomId) return;

        try {
            multiplayer.joinRoom(roomId);
            this.startMultiplayerGame(gameType);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    showWaitingRoom(gameType, roomId) {
        const container = document.getElementById('multiplayer-content');
        
        const content = `
            <div class="waiting-room">
                <h2>⏳ Waiting for opponent...</h2>
                <div class="room-id-display">
                    <div class="room-id-label">Room ID:</div>
                    <div class="room-id-value">${roomId}</div>
                </div>
                
                <div class="waiting-animation">
                    <div class="pulse-dot"></div>
                    <div class="pulse-dot"></div>
                    <div class="pulse-dot"></div>
                </div>

                <button class="game-btn game-btn-secondary" onclick="multiplayer.shareRoom('${gameType}')">
                    📢 Share with Friend
                </button>

                <button class="game-btn" onclick="app.cancelWaitingRoom()">
                    ❌ Cancel
                </button>
            </div>
        `;

        container.innerHTML = content;

        const checkInterval = setInterval(() => {
            if (multiplayer.isRoomReady()) {
                clearInterval(checkInterval);
                this.startMultiplayerGame(gameType);
            }
        }, 500);

        this.waitingInterval = checkInterval;
    }

    cancelWaitingRoom() {
        if (this.waitingInterval) {
            clearInterval(this.waitingInterval);
        }
        multiplayer.leaveRoom();
        this.showMainMenu();
    }

    startMultiplayerGame(gameType) {
        if (this.roomsInterval) clearInterval(this.roomsInterval);
        if (this.waitingInterval) clearInterval(this.waitingInterval);

        this.showGameScreen();
        const game = this.games[gameType];
        
        console.log('Starting multiplayer game:', gameType);
        console.log('Game object:', game);
        console.log('Has initMultiplayer:', game && game.initMultiplayer);
        console.log('Multiplayer roomId:', multiplayer?.roomId);
        
        if (game && game.initMultiplayer) {
            // Use multiplayer mode if available
            console.log('Using initMultiplayer for', gameType);
            game.initMultiplayer();
        } else if (game && game.init) {
            // For games without multiplayer, show a message and use regular mode
            game.init();
            setTimeout(() => {
                const resultDiv = document.getElementById('game-content');
                if (resultDiv) {
                    resultDiv.innerHTML = `
                        <div class="game-title-screen">🎮 ${gameType} - Multiplayer</div>
                        <div class="multiplayer-info">
                            <div class="room-info">Room: ${multiplayer?.roomId || 'Unknown'}</div>
                            <div class="players-info">
                                <div class="player">You: ${leaderboard?.currentUser?.firstName || 'Player'}</div>
                                <div class="player">Opponent: Connected!</div>
                            </div>
                        </div>
                        <div class="game-result">Multiplayer mode activated! Play as usual.</div>
                        <button class="game-btn" onclick="app.showMultiplayerLobby()">Back to Lobby</button>
                    `;
                }
            }, 100);
        }
    }

    updateRoomsList(gameType) {
        const container = document.getElementById('rooms-container');
        if (!container) return;

        const rooms = multiplayer.getActiveRooms(gameType);

        if (rooms.length === 0) {
            container.innerHTML = '<p class="no-rooms">No rooms available. Create one!</p>';
            return;
        }

        container.innerHTML = rooms.map(room => `
            <div class="room-item">
                <div class="room-info">
                    <div class="room-host">${room.hostName}</div>
                    <div class="room-time">${this.getTimeAgo(room.created)}</div>
                </div>
                <button class="game-btn-small" onclick="app.joinRoomById('${room.id}', '${gameType}')">
                    Join
                </button>
            </div>
        `).join('');
    }

    joinRoomById(roomId, gameType) {
        try {
            multiplayer.joinRoom(roomId);
            this.startMultiplayerGame(gameType);
        } catch (error) {
            alert('Error: ' + error.message);
            this.updateRoomsList(gameType);
        }
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }

    playAgain() {
        if (this.currentGame) {
            this.startGame(this.currentGame);
        }
    }

    updateGameGrid() {
        const gameGrid = document.getElementById('game-grid');
        const games = [
            {
                id: 'dice',
                icon: '🎲',
                title: 'Dice Roll',
                description: 'Roll the dice and see who gets the higher number!',
                difficulty: 'Easy',
                multiplayer: true
            },
            {
                id: 'rps',
                icon: '✂️',
                title: 'Rock Paper Scissors',
                description: 'Classic game against the bot!',
                difficulty: 'Easy',
                multiplayer: true
            },
            {
                id: 'reaction',
                icon: '⏱️',
                title: 'Reaction Test',
                description: 'Test your reflexes and speed!',
                difficulty: 'Medium',
                multiplayer: true
            },
            {
                id: 'tic-tac-toe',
                icon: '❌',
                title: 'Tic Tac Toe',
                description: 'Play against friend or AI!',
                difficulty: 'Easy',
                multiplayer: true
            },
            {
                id: 'memory',
                icon: '🧠',
                title: 'Memory Match',
                description: 'Match the cards and test your memory!',
                difficulty: 'Hard'
            },
            {
                id: 'snake',
                icon: '🐍',
                title: 'Snake',
                description: 'Classic snake game with controls!',
                difficulty: 'Medium'
            },
            {
                id: 'slots',
                icon: '🎰',
                title: 'Slots',
                description: 'Spin the reels and win!',
                difficulty: 'Easy'
            },
            {
                id: 'color-match',
                icon: '🎨',
                title: 'Color Match',
                description: 'Match colors fast! Brain teaser game!',
                difficulty: 'Medium'
            }
        ];

        gameGrid.innerHTML = '';
        games.forEach(game => {
            const gameCard = Utils.createElement('div', 'game-card');
            gameCard.innerHTML = `
                <div class="game-difficulty">${game.difficulty}</div>
                <span class="game-icon">${game.icon}</span>
                <div class="game-title">${game.title}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-actions">
                    <button class="game-card-btn" onclick="event.stopPropagation(); app.startGame('${game.id}', false)">
                        🎮 Solo
                    </button>
                    ${game.multiplayer ? `
                        <button class="game-card-btn multiplayer-btn" onclick="event.stopPropagation(); app.startGame('${game.id}', true)">
                            👥 VS
                        </button>
                    ` : ''}
                </div>
            `;
            gameGrid.appendChild(gameCard);
        });
    }
}

// Global app instance
const app = new App();

// Settings functions for HTML onclick handlers
window.settings = {
    toggleSound: () => settings.toggleSound(),
    toggleHaptic: () => settings.toggleHaptic(),
    toggleAnimations: () => settings.toggleAnimations(),
    resetStats: () => {
        if (confirm('Are you sure you want to reset all statistics?')) {
            stats.reset();
            Utils.playSound('click');
            Utils.vibrate([100, 50, 100]);
        }
    }
};
