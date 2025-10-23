// Simple Multiplayer System (LocalStorage + Sharing)
class SimpleMultiplayer {
    constructor() {
        this.roomId = null;
        this.playerId = null;
        this.isHost = false;
        this.gameType = null;
        this.roomData = null;
        this.onStateUpdate = null;
        
        this.init();
    }

    init() {
        // Get player ID from Telegram
        if (leaderboard.currentUser) {
            this.playerId = leaderboard.currentUser.id;
        } else {
            this.playerId = 'player_' + Date.now();
        }
    }

    // Generate short room code (5 characters)
    generateRoomId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Create room
    createRoom(gameType) {
        this.roomId = this.generateRoomId();
        this.isHost = true;
        this.gameType = gameType;

        const roomData = {
            id: this.roomId,
            gameType: gameType,
            host: this.playerId,
            hostName: leaderboard.currentUser?.userName || 'Player 1',
            guest: null,
            guestName: null,
            state: 'waiting',
            gameState: null,
            created: Date.now(),
            lastUpdate: Date.now()
        };

        this.roomData = roomData;
        this.saveRoom(roomData);
        
        return this.roomId;
    }

    // Join room (simulated)
    joinRoom(roomId) {
        this.roomId = roomId;
        this.isHost = false;
        
        // Simulate joining
        const roomData = {
            id: roomId,
            gameType: this.gameType,
            host: 'opponent_' + Date.now(),
            hostName: 'Opponent',
            guest: this.playerId,
            guestName: leaderboard.currentUser?.userName || 'Player 2',
            state: 'playing',
            gameState: null,
            created: Date.now() - 10000,
            lastUpdate: Date.now()
        };

        this.roomData = roomData;
        return true;
    }

    // Update game state
    updateGameState(state) {
        if (this.roomData) {
            this.roomData.gameState = state;
            this.roomData.lastUpdate = Date.now();
            this.saveRoom(this.roomData);
        }
    }

    // Get game state
    getGameState() {
        return this.roomData?.gameState || null;
    }

    // Check if room is ready
    isRoomReady() {
        return this.roomData?.state === 'playing';
    }

    // Get active rooms (simulated)
    getActiveRooms(gameType) {
        // Simulate some active rooms
        const rooms = [];
        for (let i = 0; i < 3; i++) {
            rooms.push({
                id: this.generateRoomId(),
                gameType: gameType,
                hostName: 'Player ' + (i + 1),
                created: Date.now() - (i * 30000)
            });
        }
        return rooms;
    }

    // Save room to localStorage
    saveRoom(room) {
        localStorage.setItem('mp_room_' + room.id, JSON.stringify(room));
    }

    // Load room from localStorage
    loadRoom(roomId) {
        const data = localStorage.getItem('mp_room_' + roomId);
        return data ? JSON.parse(data) : null;
    }

    // Leave room
    leaveRoom() {
        if (this.isHost && this.roomId) {
            localStorage.removeItem('mp_room_' + this.roomId);
        }
        this.roomId = null;
        this.roomData = null;
    }

    // Share room via Telegram
    shareRoom() {
        const roomId = this.roomId;
        const botUsername = 'miniarcades_bot';

        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const message = `🎮 Join my ${this.gameType} game!\n\nRoom Code: ${roomId}\n\nClick to join!`;
            const url = `https://t.me/${botUsername}?start=join_${roomId}`;
            
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`);
        } else {
            // Fallback for non-Telegram
            const shareText = `Join my ${this.gameType} game!\nRoom Code: ${roomId}\n\nPlay at: https://t.me/${botUsername}`;
            if (navigator.share) {
                navigator.share({ text: shareText });
            } else {
                navigator.clipboard.writeText(shareText);
                alert('Room code copied to clipboard!');
            }
        }
    }
}

// Use simple multiplayer
const multiplayer = new SimpleMultiplayer();
