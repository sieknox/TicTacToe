const gameContainer = document.getElementById('game');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
const winningMessageElement = document.getElementById('winning-message');
const turnIndicator = document.getElementById('turn-indicator');
const restartButton = document.getElementById('restartButton');
const start3x3Button = document.getElementById('start-3x3');
const start5x5Button = document.getElementById('start-5x5');
let isCircleTurn;
let cellElements;
let boardSize;
let winningCombinations;

start3x3Button.addEventListener('click', () => startGame(3));
start5x5Button.addEventListener('click', () => startGame(5));
restartButton.addEventListener('click', () => startGame(boardSize));

function startGame(size) {
    boardSize = size;
    createBoard(size);
    generateWinningCombinations(size);
    isCircleTurn = false;

    cellElements = document.querySelectorAll('[data-cell]');
    cellElements.forEach(cell => {
        cell.classList.remove('x', 'circle', 'winning');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    winningMessageElement.classList.add('hidden');
    updateTurnIndicator();
}

function createBoard(size) {
    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = `repeat(${size}, 100px)`;
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-cell', '');
        gameContainer.appendChild(cell);
    }
}

function generateWinningCombinations(size) {
    winningCombinations = [];
    // Rows
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(i * size + j);
        }
        winningCombinations.push(row);
    }
    // Columns
    for (let i = 0; i < size; i++) {
        const column = [];
        for (let j = 0; j < size; j++) {
            column.push(i + j * size);
        }
        winningCombinations.push(column);
    }
    // Diagonals
    const diagonal1 = [];
    const diagonal2 = [];
    for (let i = 0; i < size; i++) {
        diagonal1.push(i * size + i);
        diagonal2.push((i + 1) * (size - 1));
    }
    winningCombinations.push(diagonal1, diagonal2);
}

function handleClick(e) {
    const cell = e.target;
    const currentClass = isCircleTurn ? 'circle' : 'x';
    placeMark(cell, currentClass);
    const winningCombination = checkWin(currentClass);
    if (winningCombination) {
        endGame(false, winningCombination);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
        updateTurnIndicator();
    }
}

function endGame(draw, winningCombination = null) {
    if (draw) {
        winningMessageTextElement.innerText = 'Draw!';
    } else {
        winningMessageTextElement.innerText = `${isCircleTurn ? "O's" : "X's"} Wins!`;
        highlightWinningCells(winningCombination);
    }
    winningMessageElement.classList.remove('hidden');
    turnIndicator.classList.add('hidden'); // Hide turn indicator when game ends
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains('x') || cell.classList.contains('circle');
    });
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    isCircleTurn = !isCircleTurn;
}

function setBoardHoverClass() {
    gameContainer.classList.remove('x');
    gameContainer.classList.remove('circle');
    gameContainer.classList.add(isCircleTurn ? 'circle' : 'x');
}

function updateTurnIndicator() {
    turnIndicator.innerText = `${isCircleTurn ? "O's" : "X's"} Turn`;
    turnIndicator.classList.remove('hidden');
}

function checkWin(currentClass) {
    for (const combination of winningCombinations) {
        if (combination.every(index => cellElements[index].classList.contains(currentClass))) {
            return combination;
        }
    }
    return null;
}

function highlightWinningCells(winningCombination) {
    winningCombination.forEach(index => {
        cellElements[index].classList.add('winning');
    });
}
