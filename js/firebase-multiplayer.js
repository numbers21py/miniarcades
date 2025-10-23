// Firebase Multiplayer System
class FirebaseMultiplayer {
    constructor() {
        this.roomId = null;
        this.playerId = null;
        this.isHost = false;
        this.gameType = null;
        this.roomRef = null;
        this.onStateUpdate = null;
        this.useFirebase = typeof database !== 'undefined';
        
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

    // Generate short room code
    generateRoomId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Create room
    async createRoom(gameType) {
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

        if (this.useFirebase) {
            try {
                this.roomRef = database.ref('rooms/' + this.roomId);
                await this.roomRef.set(roomData);
                this.listenToRoom();
            } catch (error) {
                console.error('Firebase error:', error);
                this.useFallback(roomData);
            }
        } else {
            this.useFallback(roomData);
        }

        return this.roomId;
    }

    // Join room
    async joinRoom(roomId) {
        this.roomId = roomId;
        this.isHost = false;

        if (this.useFirebase) {
            try {
                this.roomRef = database.ref('rooms/' + roomId);
                const snapshot = await this.roomRef.once('value');
                const room = snapshot.val();

                if (!room) {
                    throw new Error('Room not found');
                }

                if (room.guest) {
                    throw new Error('Room is full');
                }

                await this.roomRef.update({
                    guest: this.playerId,
                    guestName: leaderboard.currentUser?.userName || 'Player 2',
                    state: 'playing',
                    lastUpdate: Date.now()
                });

                this.listenToRoom();
                return true;
            } catch (error) {
                console.error('Join error:', error);
                throw error;
            }
        } else {
            return this.joinRoomFallback(roomId);
        }
    }

    // Listen to room updates
    listenToRoom() {
        if (!this.roomRef) return;

        this.roomRef.on('value', (snapshot) => {
            const room = snapshot.val();
            if (room && this.onStateUpdate) {
                this.onStateUpdate(room);
            }
        });
    }

    // Update game state
    async updateGameState(state) {
        if (this.useFirebase && this.roomRef) {
            try {
                await this.roomRef.update({
                    gameState: state,
                    lastUpdate: Date.now()
                });
            } catch (error) {
                console.error('Update error:', error);
            }
        } else {
            this.updateGameStateFallback(state);
        }
    }

    // Leave room
    async leaveRoom() {
        if (this.useFirebase && this.roomRef) {
            try {
                if (this.isHost) {
                    await this.roomRef.remove();
                } else {
                    await this.roomRef.update({
                        guest: null,
                        guestName: null,
                        state: 'waiting'
                    });
                }
                this.roomRef.off();
            } catch (error) {
                console.error('Leave error:', error);
            }
        } else {
            this.leaveRoomFallback();
        }

        this.roomId = null;
        this.roomRef = null;
    }

    // Get active rooms
    async getActiveRooms(gameType) {
        if (this.useFirebase) {
            try {
                const snapshot = await database.ref('rooms')
                    .orderByChild('gameType')
                    .equalTo(gameType)
                    .once('value');

                const rooms = [];
                snapshot.forEach((child) => {
                    const room = child.val();
                    if (room.state === 'waiting' && !room.guest) {
                        rooms.push(room);
                    }
                });

                return rooms;
            } catch (error) {
                console.error('Get rooms error:', error);
                return this.getActiveRoomsFallback(gameType);
            }
        } else {
            return this.getActiveRoomsFallback(gameType);
        }
    }

    // Fallback methods using LocalStorage
    useFallback(roomData) {
        localStorage.setItem('mp_room_' + this.roomId, JSON.stringify(roomData));
    }

    joinRoomFallback(roomId) {
        const roomData = localStorage.getItem('mp_room_' + roomId);
        if (!roomData) {
            throw new Error('Room not found');
        }

        const room = JSON.parse(roomData);
        if (room.guest) {
            throw new Error('Room is full');
        }

        room.guest = this.playerId;
        room.guestName = leaderboard.currentUser?.userName || 'Player 2';
        room.state = 'playing';
        localStorage.setItem('mp_room_' + roomId, JSON.stringify(room));

        return true;
    }

    updateGameStateFallback(state) {
        const roomData = localStorage.getItem('mp_room_' + this.roomId);
        if (roomData) {
            const room = JSON.parse(roomData);
            room.gameState = state;
            room.lastUpdate = Date.now();
            localStorage.setItem('mp_room_' + this.roomId, JSON.stringify(room));
        }
    }

    leaveRoomFallback() {
        if (this.isHost) {
            localStorage.removeItem('mp_room_' + this.roomId);
        }
    }

    getActiveRoomsFallback(gameType) {
        const rooms = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('mp_room_')) {
                const room = JSON.parse(localStorage.getItem(key));
                if (room.gameType === gameType && room.state === 'waiting' && !room.guest) {
                    rooms.push(room);
                }
            }
        }
        return rooms;
    }

    // Share room
    shareRoom() {
        const roomId = this.roomId;
        const botUsername = 'miniarcades_bot';

        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            const message = `🎮 Join my ${this.gameType} game!\n\nRoom Code: ${roomId}`;
            const url = `https://t.me/${botUsername}?start=join_${roomId}`;
            
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`);
        }
    }
}

// Use Firebase multiplayer if available, otherwise use old one
const multiplayerBackend = new FirebaseMultiplayer();

