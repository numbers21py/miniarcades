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
