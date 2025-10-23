// Slots Game Implementation
class SlotsGame {
    constructor() {
        this.gameData = null;
        this.symbols = ['🍒', '🍋', '🍊', '🍇', '🍓', '⭐', '💎', '7️⃣'];
        this.isSpinning = false;
    }

    init() {
        const gameStats = stats.getStats().slots;
        const content = `
            <div class="game-title-screen">🎰 Slots</div>
            <div class="slots-container">
                <div class="slots-reel" id="reel1">🍒</div>
                <div class="slots-reel" id="reel2">🍒</div>
                <div class="slots-reel" id="reel3">🍒</div>
            </div>
            <div id="slots-result" class="game-result">${gameStats.total > 0 ? 'Ready to spin!' : 'No spins yet'}</div>
            <div class="game-stats">
                <span>Total: ${gameStats.total}</span>
                <span>Wins: ${gameStats.wins}</span>
                <span>Best: ${gameStats.bestWin}</span>
            </div>
            <div class="game-buttons">
                <button class="game-btn game-btn-secondary" onclick="slotsGame.showRules()">📖 Rules</button>
                <button class="game-btn" onclick="slotsGame.spin()" id="spin-btn">Spin!</button>
            </div>
        `;
        document.getElementById('game-content').innerHTML = content;
    }

    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        const spinBtn = document.getElementById('spin-btn');
        const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
        
        spinBtn.disabled = true;
        spinBtn.textContent = 'Spinning...';
        
        Utils.playSound('click');
        Utils.vibrate([50]);
        
        // Анимация вращения
        reels.forEach((reel, index) => {
            reel.classList.add('spinning');
            setTimeout(() => {
                const symbol = this.symbols[Utils.getRandomInt(0, this.symbols.length - 1)];
                reel.textContent = symbol;
                reel.classList.remove('spinning');
            }, 500 + (index * 200));
        });
        
        // Проверка результата
        setTimeout(() => {
            const symbols = reels.map(reel => reel.textContent);
            const result = this.checkWin(symbols);
            
            this.isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.textContent = 'Spin!';
            
            this.showResult(result, symbols);
        }, 1500);
    }

    checkWin(symbols) {
        // Все одинаковые - джекпот
        if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
            return { type: 'jackpot', multiplier: 10, message: '🎉 JACKPOT! 🎉' };
        }
        
        // Два одинаковых
        if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
            return { type: 'win', multiplier: 3, message: '🎊 You Win! 🎊' };
        }
        
        // Есть 7 или алмаз
        if (symbols.includes('7️⃣') || symbols.includes('💎')) {
            return { type: 'bonus', multiplier: 2, message: '⭐ Bonus! ⭐' };
        }
        
        return { type: 'lose', multiplier: 0, message: '😔 Try Again!' };
    }

    showResult(result, symbols) {
        const resultDiv = document.getElementById('slots-result');
        resultDiv.innerHTML = `
            <div class="result-text">${result.message}</div>
            <div class="result-details">${symbols.join(' | ')}</div>
        `;
        
        // Обновляем статистику
        stats.updateGameStats('slots', result.type === 'lose' ? 'loss' : 'win', { 
            multiplier: result.multiplier,
            win: result.multiplier > 0 ? result.multiplier : 0
        });
        
        const gameStats = stats.getStats().slots;
        document.querySelector('.game-stats').innerHTML = `
            <span>Total: ${gameStats.total}</span>
            <span>Wins: ${gameStats.wins}</span>
            <span>Best: ${gameStats.bestWin}</span>
        `;
        
        if (result.type !== 'lose') {
            Utils.playSound('success');
            Utils.vibrate([100, 50, 100]);
        } else {
            Utils.playSound('error');
            Utils.vibrate([200]);
        }
    }

    showRules() {
        const rulesContent = `
            <div class="rules-popup">
                <div class="rules-content">
                    <h3>🎰 Slots Rules</h3>
                    <div class="rules-text">
                        <p><strong>How to Play:</strong></p>
                        <p>• Spin the reels and match symbols</p>
                        <p>• <strong>Jackpot (10x):</strong> All 3 symbols match</p>
                        <p>• <strong>Win (3x):</strong> Any 2 symbols match</p>
                        <p>• <strong>Bonus (2x):</strong> Contains 7️⃣ or 💎</p>
                        <p>• <strong>Lose:</strong> No matches</p>
                        <br>
                        <p><strong>Symbols:</strong></p>
                        <p>🍒 🍋 🍊 🍇 🍓 ⭐ 💎 7️⃣</p>
                    </div>
                    <button class="btn" onclick="slotsGame.closeRules()">Got it!</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', rulesContent);
        Utils.playSound('click');
    }

    closeRules() {
        const popup = document.querySelector('.rules-popup');
        if (popup) {
            popup.remove();
        }
    }
}

// Global slots game instance
const slotsGame = new SlotsGame();
