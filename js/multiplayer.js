// Multiplayer System using Simple P2P with LocalStorage sync
class Multiplayer {
    constructor() {
        this.roomId = null;
        this.playerId = null;
        this.opponentId = null;
        this.isHost = false;
        this.gameState = null;
        this.syncInterval = null;
        this.onStateUpdate = null;
        this.storage_key_prefix = 'mp_room_';
        
        this.init();
    }

    init() {
        // Get player ID from Telegram or generate
        if (leaderboard.currentUser) {
            this.playerId = leaderboard.currentUser.id;
        } else {
            this.playerId = 'player_' + Date.now();
        }
    }

    // Create a new multiplayer room
    createRoom(gameType) {
        this.roomId = this.generateRoomId();
        this.isHost = true;
        
        const room = {
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

        this.saveRoom(room);
        this.startSync();
        
        return this.roomId;
    }

    // Join existing room
    async joinRoom(roomId) {
        const room = this.loadRoom(roomId);
        
        if (!room) {
            throw new Error('Room not found');
        }

        if (room.state !== 'waiting') {
            throw new Error('Room is not available');
        }

        if (room.guest) {
            throw new Error('Room is full');
        }

        this.roomId = roomId;
        this.isHost = false;
        this.opponentId = room.host;

        room.guest = this.playerId;
        room.guestName = leaderboard.currentUser?.userName || 'Player 2';
        room.state = 'playing';
        room.lastUpdate = Date.now();

        this.saveRoom(room);
        this.startSync();

        return room;
    }

    // Update game state
    updateGameState(state) {
        if (!this.roomId) return;

        const room = this.loadRoom(this.roomId);
        if (!room) return;

        room.gameState = state;
        room.lastUpdate = Date.now();
        this.saveRoom(room);
    }

    // Get current game state
    getGameState() {
        if (!this.roomId) return null;
        
        const room = this.loadRoom(this.roomId);
        return room?.gameState || null;
    }

    // Start syncing room state
    startSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            if (!this.roomId) {
                this.stopSync();
                return;
            }

            const room = this.loadRoom(this.roomId);
            
            if (!room) {
                this.stopSync();
                return;
            }

            // Check if room is still active (timeout after 5 minutes)
            const timeout = 5 * 60 * 1000;
            if (Date.now() - room.lastUpdate > timeout) {
                this.leaveRoom();
                return;
            }

            // Notify about state changes
            if (this.onStateUpdate && room.gameState) {
                this.onStateUpdate(room.gameState);
            }
        }, 500); // Sync every 500ms
    }

    // Stop syncing
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Leave room
    leaveRoom() {
        this.stopSync();
        
        if (this.roomId) {
            const room = this.loadRoom(this.roomId);
            if (room) {
                if (this.isHost) {
                    // Host left - close room
                    this.deleteRoom(this.roomId);
                } else {
                    // Guest left - mark as waiting
                    room.guest = null;
                    room.guestName = null;
                    room.state = 'waiting';
                    room.lastUpdate = Date.now();
                    this.saveRoom(room);
                }
            }
        }

        this.roomId = null;
        this.opponentId = null;
        this.isHost = false;
        this.gameState = null;
    }

    // Generate room ID
    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save room to storage
    saveRoom(room) {
        localStorage.setItem(this.storage_key_prefix + room.id, JSON.stringify(room));
    }

    // Load room from storage
    loadRoom(roomId) {
        const data = localStorage.getItem(this.storage_key_prefix + roomId);
        return data ? JSON.parse(data) : null;
    }

    // Delete room
    deleteRoom(roomId) {
        localStorage.removeItem(this.storage_key_prefix + roomId);
    }

    // Get all active rooms
    getActiveRooms() {
        const rooms = [];
        const now = Date.now();
        const timeout = 5 * 60 * 1000;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.storage_key_prefix)) {
                const room = JSON.parse(localStorage.getItem(key));
                
                // Remove old rooms
                if (now - room.lastUpdate > timeout) {
                    localStorage.removeItem(key);
                    continue;
                }

                if (room.state === 'waiting') {
                    rooms.push(room);
                }
            }
        }

        return rooms;
    }

    // Share room via Telegram
    shareRoom(gameType) {
        const roomId = this.roomId;
        const botUsername = 'miniarcades_bot';
        
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const message = `🎮 Join me for ${gameType}!\n\nRoom ID: ${roomId}`;
            const url = `https://t.me/${botUsername}?start=join_${roomId}`;
            
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`);
        } else {
            // Fallback: copy to clipboard
            const shareText = `Room ID: ${roomId}\n\nShare this ID with your friend!`;
            navigator.clipboard.writeText(roomId).then(() => {
                alert(`${shareText}\n\nID copied to clipboard!`);
            });
        }
    }

    // Get opponent name
    getOpponentName() {
        if (!this.roomId) return 'Opponent';
        
        const room = this.loadRoom(this.roomId);
        if (!room) return 'Opponent';

        return this.isHost ? room.guestName : room.hostName;
    }

    // Check if room is ready
    isRoomReady() {
        if (!this.roomId) return false;
        
        const room = this.loadRoom(this.roomId);
        return room && room.state === 'playing' && room.host && room.guest;
    }
}

// Global multiplayer instance
const multiplayer = new Multiplayer();

