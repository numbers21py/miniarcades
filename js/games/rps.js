// Rock Paper Scissors Game Implementation
class RPSGame {
    constructor() {
        this.gameData = null;
    }

    init() {
        const content = `
            <div class="game-title-screen">✂️ Rock Paper Scissors</div>
            <div class="rps-choices">
                <button class="rps-choice" onclick="rpsGame.play('rock')">🪨</button>
                <button class="rps-choice" onclick="rpsGame.play('paper')">📄</button>
                <button class="rps-choice" onclick="rpsGame.play('scissors')">✂️</button>
            </div>
            <div id="rps-result" class="game-result"></div>
            <div class="game-stats">
                <span>Wins: ${stats.getStats().rps.wins}</span>
                <span>Streak: ${stats.getStats().rps.winStreak}</span>
                <span>Best: ${stats.getStats().rps.bestStreak}</span>
            </div>
        `;
        document.getElementById('game-content').innerHTML = content;
    }

    initMultiplayer() {
        const roomId = multiplayer?.roomId || 'Unknown';
        const content = `
            <div class="game-title-screen">✂️ Rock Paper Scissors - Multiplayer</div>
            <div class="multiplayer-info">
                <div class="room-info">Room: ${roomId}</div>
                <div class="players-info">
                    <div class="player">You: ${leaderboard?.currentUser?.firstName || 'Player'}</div>
                    <div class="player">Opponent: Waiting...</div>
                </div>
            </div>
            <div class="rps-choices">
                <button class="rps-choice" onclick="rpsGame.playMultiplayer('rock')">🪨</button>
                <button class="rps-choice" onclick="rpsGame.playMultiplayer('paper')">📄</button>
                <button class="rps-choice" onclick="rpsGame.playMultiplayer('scissors')">✂️</button>
            </div>
            <div id="rps-result" class="game-result">Choose your move!</div>
            <div class="game-stats">
                <span>Wins: ${stats.getStats().rps.wins}</span>
                <span>Streak: ${stats.getStats().rps.winStreak}</span>
                <span>Best: ${stats.getStats().rps.bestStreak}</span>
            </div>
        `;
        document.getElementById('game-content').innerHTML = content;
    }

    playMultiplayer(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const opponentChoice = choices[Utils.getRandomInt(0, 2)];
        
        const choiceEmojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };
        
        const result = this.determineWinner(playerChoice, opponentChoice);
        
        document.getElementById('rps-result').innerHTML = `
            <div class="result-text">${result.message}</div>
            <div class="result-details">
                You: ${choiceEmojis[playerChoice]} | Opponent: ${choiceEmojis[opponentChoice]}
            </div>
        `;
        
        if (result.winner === 'player') {
            stats.updateGameStats('rps', { result: 'win' });
        } else if (result.winner === 'opponent') {
            stats.updateGameStats('rps', { result: 'loss' });
        } else {
            stats.updateGameStats('rps', { result: 'tie' });
        }
        
        Utils.playSound('click');
        Utils.vibrate([50]);
    }

    play(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[Utils.getRandomInt(0, 2)];
        
        const choiceEmojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };
        
        const result = this.determineWinner(playerChoice, botChoice);
        
        Utils.playSound('click');
        Utils.vibrate([50]);
        
        const resultDiv = document.getElementById('rps-result');
        resultDiv.innerHTML = `
            <div class="result-text">${result}</div>
            <div class="result-details">You: ${choiceEmojis[playerChoice]} vs Bot: ${choiceEmojis[botChoice]}</div>
        `;
        
        // Обновляем статистику
        document.querySelector('.game-stats').innerHTML = `
            <span>Wins: ${stats.getStats().rps.wins}</span>
            <span>Streak: ${stats.getStats().rps.winStreak}</span>
            <span>Best: ${stats.getStats().rps.bestStreak}</span>
        `;
        
        if (result.includes('Win')) {
            stats.updateGameStats('rps', 'win');
            Utils.playSound('success');
            Utils.vibrate([100, 50, 100]);
        } else if (result.includes('Lose')) {
            stats.updateGameStats('rps', 'loss');
            Utils.playSound('error');
            Utils.vibrate([200]);
        } else {
            stats.updateGameStats('rps', 'tie');
        }
    }

    determineWinner(player, bot) {
        if (player === bot) {
            return '🤝 It\'s a Tie!';
        }
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        
        if (winConditions[player] === bot) {
            return '🎉 You Win!';
        } else {
            return '😔 You Lose!';
        }
    }
}

// Global RPS game instance
const rpsGame = new RPSGame();
