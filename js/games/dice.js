// Dice Game Implementation
class DiceGame {
    constructor() {
        this.gameData = null;
    }

    init() {
        const gameStats = stats.getStats().dice;
        const content = `
            <div class="game-title-screen">🎲 Dice Roll</div>
            <div class="dice-container">
                <div class="dice" id="player-dice">⚀</div>
                <div class="vs-text">VS</div>
                <div class="dice" id="bot-dice">⚀</div>
            </div>
            <div id="dice-result" class="game-result">${gameStats.total > 0 ? 'Ready to roll!' : 'No games played yet'}</div>
            <div class="game-stats">
                <span>Wins: ${gameStats.wins}</span>
                <span>Streak: ${gameStats.winStreak}</span>
                <span>Best: ${gameStats.bestStreak}</span>
            </div>
            <button class="game-btn" onclick="diceGame.roll()">Roll Dice!</button>
        `;
        document.getElementById('game-content').innerHTML = content;
    }

    initMultiplayer() {
        const gameStats = stats.getStats().dice;
        const content = `
            <div class="game-title-screen">🎲 Dice Roll - Multiplayer</div>
            <div class="multiplayer-info">
                <div class="room-info">Room: ${multiplayer.roomId}</div>
                <div class="players-info">
                    <div class="player">You: ${leaderboard.currentUser?.firstName || 'Player'}</div>
                    <div class="player">Opponent: Waiting...</div>
                </div>
            </div>
            <div class="dice-container">
                <div class="dice" id="player-dice">⚀</div>
                <div class="vs-text">VS</div>
                <div class="dice" id="opponent-dice">⚀</div>
            </div>
            <div id="dice-result" class="game-result">Waiting for opponent...</div>
            <div class="game-stats">
                <span>Wins: ${gameStats.wins}</span>
                <span>Streak: ${gameStats.winStreak}</span>
                <span>Best: ${gameStats.bestStreak}</span>
            </div>
            <button class="game-btn" onclick="diceGame.rollMultiplayer()" id="roll-btn">Roll Dice!</button>
        `;
        document.getElementById('game-content').innerHTML = content;
    }

    rollMultiplayer() {
        const playerDice = document.getElementById('player-dice');
        const opponentDice = document.getElementById('opponent-dice');
        const rollBtn = document.getElementById('roll-btn');
        const resultDiv = document.getElementById('dice-result');
        
        rollBtn.disabled = true;
        rollBtn.textContent = 'Rolling...';
        playerDice.classList.add('rolling');
        opponentDice.classList.add('rolling');
        
        Utils.playSound('click');
        Utils.vibrate([50]);
        
        setTimeout(() => {
            const playerRoll = Utils.getRandomInt(1, 6);
            const opponentRoll = Utils.getRandomInt(1, 6);
            
            playerDice.textContent = this.getDiceEmoji(playerRoll);
            opponentDice.textContent = this.getDiceEmoji(opponentRoll);
            
            playerDice.classList.remove('rolling');
            opponentDice.classList.remove('rolling');
            
            let result;
            if (playerRoll > opponentRoll) {
                result = 'You win! 🎉';
                stats.updateGameStats('dice', { result: 'win' });
            } else if (playerRoll < opponentRoll) {
                result = 'Opponent wins! 😔';
                stats.updateGameStats('dice', { result: 'loss' });
            } else {
                result = 'It\'s a tie! 🤝';
                stats.updateGameStats('dice', { result: 'tie' });
            }
            
            resultDiv.innerHTML = `
                <div class="result-text">${result}</div>
                <div class="result-details">You: ${playerRoll} | Opponent: ${opponentRoll}</div>
            `;
            
            rollBtn.disabled = false;
            rollBtn.textContent = 'Roll Again!';
            
            Utils.playSound('success');
            Utils.vibrate([100, 50, 100]);
        }, 1500);
    }

    roll() {
        const playerDice = document.getElementById('player-dice');
        const botDice = document.getElementById('bot-dice');
        const rollBtn = document.querySelector('.game-btn');
        const resultDiv = document.getElementById('dice-result');
        
        rollBtn.disabled = true;
        rollBtn.textContent = 'Rolling...';
        playerDice.classList.add('rolling');
        botDice.classList.add('rolling');
        
        Utils.playSound('click');
        Utils.vibrate([50]);
        
        setTimeout(() => {
            const playerRoll = Utils.getRandomInt(1, 6);
            const botRoll = Utils.getRandomInt(1, 6);
            
            playerDice.textContent = this.getDiceEmoji(playerRoll);
            botDice.textContent = this.getDiceEmoji(botRoll);
            
            playerDice.classList.remove('rolling');
            botDice.classList.remove('rolling');
            
            let result;
            if (playerRoll > botRoll) {
                result = '🎉 You Win!';
                stats.updateGameStats('dice', 'win', { roll: playerRoll });
                Utils.playSound('success');
                Utils.vibrate([100, 50, 100]);
            } else if (botRoll > playerRoll) {
                result = '😔 You Lose!';
                stats.updateGameStats('dice', 'loss', { roll: playerRoll });
                Utils.playSound('error');
                Utils.vibrate([200]);
            } else {
                result = '🤝 It\'s a Tie!';
                stats.updateGameStats('dice', 'tie', { roll: playerRoll });
            }
            
            resultDiv.innerHTML = `
                <div class="result-text">${result}</div>
                <div class="result-details">Your roll: ${playerRoll} | Bot roll: ${botRoll}</div>
            `;
            
            // Обновляем статистику
            const gameStats = stats.getStats().dice;
            document.querySelector('.game-stats').innerHTML = `
                <span>Wins: ${gameStats.wins}</span>
                <span>Streak: ${gameStats.winStreak}</span>
                <span>Best: ${gameStats.bestStreak}</span>
            `;
            
            rollBtn.disabled = false;
            rollBtn.textContent = 'Roll Again!';
            
        }, 1000);
    }

    getDiceEmoji(number) {
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return diceEmojis[number - 1];
    }

    showResult(playerRoll, botRoll, result) {
        // Убираем отдельный экран результатов для дайса
        // Результат показывается прямо в игре
    }
}

// Global dice game instance
const diceGame = new DiceGame();
