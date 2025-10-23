// Reaction Test Game Implementation
class ReactionGame {
    constructor() {
        this.gameData = null;
        this.startTime = null;
        this.timeout = null;
    }

    init() {
        const gameStats = stats.getStats().reaction;
        const content = `
            <div class="game-title-screen">⏱️ Reaction Test</div>
            <div class="reaction-area waiting" id="reaction-area" onclick="reactionGame.handleClick()">
                <div>Wait for the signal...</div>
            </div>
            <div id="reaction-result" class="game-result"></div>
            <div class="game-stats">
                <span>Best: ${gameStats.bestTime ? gameStats.bestTime + 'ms' : 'N/A'}</span>
                <span>Attempts: ${gameStats.attempts}</span>
                <span>Avg: ${gameStats.averageTime ? Math.round(gameStats.averageTime) + 'ms' : 'N/A'}</span>
            </div>
            <button class="game-btn" onclick="reactionGame.start()" id="start-reaction-btn">Start Test</button>
        `;
        document.getElementById('game-content').innerHTML = content;
    }

    initMultiplayer() {
        const gameStats = stats.getStats().reaction;
        const roomId = multiplayer?.roomId || 'Unknown';
        const content = `
            <div class="game-title-screen">⏱️ Reaction Test - Multiplayer</div>
            <div class="multiplayer-info">
                <div class="room-info">Room: ${roomId}</div>
                <div class="players-info">
                    <div class="player">You: ${leaderboard?.currentUser?.firstName || 'Player'}</div>
                    <div class="player">Opponent: Ready!</div>
                </div>
            </div>
            <div class="reaction-area waiting" id="reaction-area" onclick="reactionGame.handleClickMultiplayer()">
                <div>Wait for the signal...</div>
            </div>
            <div id="reaction-result" class="game-result">Both players ready! Click when you see the signal!</div>
            <div class="game-stats">
                <span>Best: ${gameStats.bestTime ? gameStats.bestTime + 'ms' : 'N/A'}</span>
                <span>Attempts: ${gameStats.attempts}</span>
                <span>Avg: ${gameStats.averageTime ? Math.round(gameStats.averageTime) + 'ms' : 'N/A'}</span>
            </div>
            <button class="game-btn" onclick="reactionGame.startMultiplayer()" id="start-reaction-btn">Start Test</button>
        `;
        document.getElementById('game-content').innerHTML = content;
    }

    startMultiplayer() {
        const area = document.getElementById('reaction-area');
        const btn = document.getElementById('start-reaction-btn');
        
        btn.disabled = true;
        btn.textContent = 'Get Ready...';
        area.classList.remove('waiting');
        area.classList.add('ready');
        area.innerHTML = '<div>Get ready...</div>';
        
        const delay = Utils.getRandomInt(2000, 5000);
        this.timeout = setTimeout(() => {
            area.classList.remove('ready');
            area.classList.add('go');
            area.innerHTML = '<div>CLICK NOW!</div>';
            this.startTime = Date.now();
        }, delay);
    }

    handleClickMultiplayer() {
        const area = document.getElementById('reaction-area');
        const btn = document.getElementById('start-reaction-btn');
        
        if (area.classList.contains('waiting') || area.classList.contains('ready')) {
            return;
        }
        
        if (area.classList.contains('go')) {
            const reactionTime = Date.now() - this.startTime;
            const result = document.getElementById('reaction-result');
            
            area.classList.remove('go');
            area.classList.add('waiting');
            area.innerHTML = '<div>Wait for the signal...</div>';
            
            result.innerHTML = `
                <div class="result-text">Your time: ${reactionTime}ms</div>
                <div class="result-details">Opponent: ${Utils.getRandomInt(150, 400)}ms</div>
            `;
            
            btn.disabled = false;
            btn.textContent = 'Try Again';
            
            stats.updateGameStats('reaction', { time: reactionTime });
            Utils.playSound('success');
            Utils.vibrate([100, 50, 100]);
        }
    }

    start() {
        const area = document.getElementById('reaction-area');
        const btn = document.getElementById('start-reaction-btn');
        
        btn.disabled = true;
        btn.textContent = 'Get Ready...';
        area.className = 'reaction-area waiting';
        area.innerHTML = '<div>Wait for the signal...</div>';
        
        Utils.playSound('click');
        
        const delay = Utils.getRandomInt(2000, 5000);
        
        this.timeout = setTimeout(() => {
            area.className = 'reaction-area ready';
            area.innerHTML = '<div>CLICK NOW!</div>';
            this.startTime = Date.now();
            Utils.playSound('success');
        }, delay);
    }

    handleClick() {
        const area = document.getElementById('reaction-area');
        
        if (area.className.includes('waiting')) {
            // Clicked too early
            area.className = 'reaction-area too-early';
            area.innerHTML = '<div>Too Early!</div>';
            clearTimeout(this.timeout);
            Utils.playSound('error');
            Utils.vibrate([200, 100, 200]);
            this.showResult('Too Early!', 0);
            return;
        }
        
        if (area.className.includes('ready')) {
            // Valid click
            const reactionTime = Date.now() - this.startTime;
            area.className = 'reaction-area waiting';
            
            stats.updateGameStats('reaction', 'completed', { time: reactionTime });
            
            Utils.playSound('success');
            Utils.vibrate([50, 25, 50]);
            
            this.showResult('Great!', reactionTime);
        }
    }

    showResult(message, time) {
        const resultDiv = document.getElementById('reaction-result');
        resultDiv.innerHTML = `
            <div class="result-text">${message}</div>
            <div class="result-details">Time: ${time}ms</div>
        `;
        
        // Обновляем статистику
        const gameStats = stats.getStats().reaction;
        document.querySelector('.game-stats').innerHTML = `
            <span>Best: ${gameStats.bestTime}ms</span>
            <span>Attempts: ${gameStats.attempts}</span>
            <span>Avg: ${Math.round(gameStats.averageTime)}ms</span>
        `;
        
        // Сбрасываем кнопку
        const btn = document.getElementById('start-reaction-btn');
        btn.disabled = false;
        btn.textContent = 'Try Again';
    }
}

// Global reaction game instance
const reactionGame = new ReactionGame();
