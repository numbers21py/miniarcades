// Tic Tac Toe Game Implementation
class TicTacToeGame {
    constructor() {
        this.gameData = null;
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameOver = false;
    }

    init() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameOver = false;
        
        const content = `
            <div class="game-title-screen">❌ Tic Tac Toe</div>
            <div class="tic-tac-toe-grid" id="tic-grid"></div>
            <div id="tic-result" class="game-result"></div>
            <div class="game-stats">
                <span>Player: ❌</span>
                <span id="tic-status">Your turn!</span>
                <span>Bot: ⭕</span>
            </div>
            <button class="game-btn" onclick="ticTacToeGame.init()">New Game</button>
        `;
        
        document.getElementById('game-content').innerHTML = content;
        
        const grid = document.getElementById('tic-grid');
        grid.innerHTML = '';
        
        // Create grid
        for (let i = 0; i < 9; i++) {
            const cell = Utils.createElement('div', 'tic-cell');
            cell.dataset.index = i;
            cell.onclick = () => this.makeMove(i);
            grid.appendChild(cell);
        }
    }

    makeMove(index) {
        if (this.board[index] || this.gameOver || this.currentPlayer !== 'X') return;
        
        this.board[index] = 'X';
        this.updateDisplay();
        
        Utils.playSound('click');
        Utils.vibrate([50]);
        
        if (this.checkWinner('X')) {
            document.getElementById('tic-result').innerHTML = `
                <div class="result-text">🎉 You Win!</div>
            `;
            document.getElementById('tic-status').textContent = 'You Win!';
            stats.updateGameStats('ticTacToe', 'win');
            Utils.playSound('success');
            Utils.vibrate([100, 50, 100]);
            this.gameOver = true;
            return;
        }
        
        if (this.board.every(cell => cell !== '')) {
            document.getElementById('tic-result').innerHTML = `
                <div class="result-text">🤝 It's a Tie!</div>
            `;
            document.getElementById('tic-status').textContent = 'Tie!';
            stats.updateGameStats('ticTacToe', 'draw');
            this.gameOver = true;
            return;
        }
        
        this.currentPlayer = 'O';
        document.getElementById('tic-status').textContent = 'Bot thinking...';
        
        setTimeout(() => {
            this.botMove();
        }, 500);
    }

    botMove() {
        const emptyCells = this.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        const randomIndex = emptyCells[Utils.getRandomInt(0, emptyCells.length - 1)];
        
        this.board[randomIndex] = 'O';
        this.updateDisplay();
        
        Utils.playSound('click');
        Utils.vibrate([50]);
        
        if (this.checkWinner('O')) {
            document.getElementById('tic-result').innerHTML = `
                <div class="result-text">😔 Bot Wins!</div>
            `;
            document.getElementById('tic-status').textContent = 'Bot Wins!';
            stats.updateGameStats('ticTacToe', 'loss');
            Utils.playSound('error');
            Utils.vibrate([200]);
            this.gameOver = true;
            return;
        }
        
        if (this.board.every(cell => cell !== '')) {
            document.getElementById('tic-result').innerHTML = `
                <div class="result-text">🤝 It's a Tie!</div>
            `;
            document.getElementById('tic-status').textContent = 'Tie!';
            stats.updateGameStats('ticTacToe', 'draw');
            this.gameOver = true;
            return;
        }
        
        this.currentPlayer = 'X';
        document.getElementById('tic-status').textContent = 'Your turn!';
    }

    updateDisplay() {
        this.board.forEach((cell, index) => {
            const cellElement = document.querySelector(`[data-index="${index}"]`);
            cellElement.textContent = cell === 'X' ? '❌' : cell === 'O' ? '⭕' : '';
            cellElement.classList.toggle('x', cell === 'X');
            cellElement.classList.toggle('o', cell === 'O');
        });
    }

    checkWinner(player) {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        return winningCombos.some(combo => 
            combo.every(index => this.board[index] === player)
        );
    }
}

// Global tic tac toe game instance
const ticTacToeGame = new TicTacToeGame();
