const gameContainer = document.getElementById('game');
const playerMarkerMessageElement = document.getElementById('player-marker-message');
const winningMessageTextElement = document.querySelector('[data-winning-message-text]');
const winningMessageElement = document.getElementById('winning-message');
const restartButton = document.getElementById('restartButton');
const start3x3Button = document.getElementById('start-3x3');
const start5x5Button = document.getElementById('start-5x5');
let isCircleTurn;
let playerClass;
let aiClass;
let boardSize;
let cellElements;
let winningCombinations;

start3x3Button.addEventListener('click', () => startGame(3));
start5x5Button.addEventListener('click', () => startGame(5));
restartButton.addEventListener('click', () => startGame(boardSize));

function startGame(size) {
    boardSize = size;
    createBoard(size);
    generateWinningCombinations(size);
    
    // Randomly assign player to X or O
    if (Math.random() < 0.5) {
        playerClass = 'x';
        aiClass = 'circle';
        isCircleTurn = false; // Player is X, so player goes first
        playerMarkerMessageElement.innerText = "You are X's. You go first.";
    } else {
        playerClass = 'circle';
        aiClass = 'x';
        isCircleTurn = true; // Player is O, so AI goes first
        playerMarkerMessageElement.innerText = "You are O's. AI goes first.";
    }

    cellElements = document.querySelectorAll('[data-cell]');
    cellElements.forEach(cell => {
        cell.classList.remove('x', 'circle', 'winning');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    winningMessageElement.classList.add('hidden');
    setClickability(!isCircleTurn); // Disable click if it's AI's turn
    if (isCircleTurn) {
        setTimeout(() => {
            aiMove();
            setClickability(true); // Enable clicks after AI's first move
        }, 500); // AI makes the first move if player is O
    }
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
    // Prevent player from clicking on a cell that is already marked
    if (cell.classList.contains('x') || cell.classList.contains('circle')) {
        return;
    }
    const currentClass = isCircleTurn ? aiClass : playerClass;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(currentClass);
    } else if (isDraw()) {
        endGame(null);
    } else {
        swapTurns();
        setBoardHoverClass();
        if (isCircleTurn) {
            setClickability(false); // Disable clicks during AI's turn
            setTimeout(() => {
                aiMove();
                if (!checkWin(aiClass) && !isDraw()) {
                    setClickability(true); // Enable clicks after AI's turn
                }
            }, 500); // AI makes a move after a short delay
        }
    }
}

function aiMove() {
    const availableCells = [...cellElements].filter(cell => !cell.classList.contains('x') && !cell.classList.contains('circle'));
    if (availableCells.length === 0) return;

    let chosenCell;
    if (Math.random() < 0.8) { // 80% chance to use strategic logic
        chosenCell = findBestMove(aiClass) || findBestMove(playerClass) || getRandomCell(availableCells);
    } else { // 20% chance to make a random move
        chosenCell = getRandomCell(availableCells);
    }

    placeMark(chosenCell, aiClass);
    if (checkWin(aiClass)) {
        endGame(aiClass);
    } else if (isDraw()) {
        endGame(null);
    } else {
        swapTurns();
        setBoardHoverClass();
    }
}

function findBestMove(currentClass) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        const cells = [cellElements[a], cellElements[b], cellElements[c]];

        const marks = cells.map(cell => cell.classList.contains(currentClass));
        const empty = cells.filter(cell => !cell.classList.contains('x') && !cell.classList.contains('circle'));

        if (marks.filter(Boolean).length === 2 && empty.length === 1) {
            return empty[0];
        }
    }
    return null;
}

function getRandomCell(availableCells) {
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
}

function endGame(winningClass) {
    if (winningClass === null) {
        winningMessageTextElement.innerText = 'Draw!';
    } else {
        winningMessageTextElement.innerText = `${winningClass === 'circle' ? "O's" : "X's"} Wins!`;
        highlightWinningCells(winningClass);
    }
    winningMessageElement.classList.remove('hidden');
    setClickability(false); // Disable clicks when game ends
}

function highlightWinningCells(winningClass) {
    winningCombinations.forEach(combination => {
        const [a, b, c] = combination;
        const cells = [cellElements[a], cellElements[b], cellElements[c]];
        if (cells.every(cell => cell.classList.contains(winningClass))) {
            cells.forEach(cell => cell.classList.add('winning'));
        }
    });
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
    gameContainer.classList.add(isCircleTurn ? aiClass : playerClass);
}

function checkWin(currentClass) {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

function setClickability(clickable) {
    cellElements.forEach(cell => {
        if (clickable) {
            cell.classList.remove('disabled');
        } else {
            cell.classList.add('disabled');
        }
    });
}
