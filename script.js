const BOARD_SIZE = 8;
const MINES_COUNT = 20;
        let board = [];
        let gameOver = false;
        let flagMode = false;
        let flagsCount = 0;
        let revealedCount = 0;
        let timerInterval = null;
        let seconds = 0;
        let firstClick = true;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        function initGame() {
            board = [];
            gameOver = false;
            flagMode = false;
            flagsCount = 0;
            revealedCount = 0;
            seconds = 0;
            firstClick = true;
            clearInterval(timerInterval);
            document.getElementById('timer').textContent = '0';
            document.getElementById('flags-count').textContent = '0';
            document.getElementById('message').className = 'message';
            document.getElementById('message').textContent = '';
            document.getElementById('flag-mode-btn').classList.remove('active');
            createBoard();
            renderBoard();
        }
        function createBoard() {
            for (let i = 0; i < BOARD_SIZE; i++) {
                board[i] = [];
                for (let j = 0; j < BOARD_SIZE; j++) {
                    board[i][j] = {
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false, adjacentMines: 0
                    };
                }
            }
        }
        function placeMines(excludeRow, excludeCol) {
            let minesPlaced = 0;
            while (minesPlaced < MINES_COUNT) {
                const row = Math.floor(Math.random() * BOARD_SIZE);
                const col = Math.floor(Math.random() * BOARD_SIZE);
                const isExcluded = Math.abs(row - excludeRow) <= 1 &&                      Math.abs(col - excludeCol) <= 1;
                if (!board[row][col].isMine && !isExcluded) { board[row][col].isMine = true;
                    minesPlaced++;
                }
            }
            calculateNumbers();
        }
        function calculateNumbers() {
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (!board[i][j].isMine) {
                        let count = 0;
                        for (let di = -1; di <= 1; di++) {
                            for (let dj = -1; dj <= 1; dj++) {
                                if (di === 0 && dj === 0) continue;       const newRow = i + di;
                const newCol = j + dj;                 if (newRow >= 0 && newRow < BOARD_SIZE &&    newCol >= 0 && newCol < BOARD_SIZE &&    board[newRow][newCol].isMine) {            count++;
                                }
                            }
                        }          board[i][j].adjacentMines = count;
                    }
                }
            }
        }
        function renderBoard() {
            const gameBoard = document.getElementById('game-board');
            gameBoard.innerHTML = '';
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    if (isTouchDevice) {
                        cell.addEventListener('click', handleTouch);
                    } else {
                        cell.addEventListener('click', handleClick);
                        cell.addEventListener('contextmenu', handleRightClick);
                    }
                    gameBoard.appendChild(cell);
                }
            }
        }
        function handleTouch(e) {
            if (gameOver) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            if (flagMode) {
                toggleFlag(row, col);
            } else {
                handleCellReveal(row, col);
            }
        }
        function handleClick(e) {
            if (gameOver) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            handleCellReveal(row, col);
        }
        function handleRightClick(e) {
            e.preventDefault();
            if (gameOver) return;
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            
            toggleFlag(row, col);
        }
        function handleCellReveal(row, col) {
            const cell = board[row][col];
            if (cell.isFlagged || cell.isRevealed) return;
            if (firstClick) {
                firstClick = false;
                placeMines(row, col);
                startTimer();
            }
            revealCell(row, col);
            
            if (!gameOver) {
                checkWin();
            }
        }
        function toggleFlag(row, col) {
            const cell = board[row][col];
            if (cell.isRevealed) return;
            if (cell.isFlagged) {
                cell.isFlagged = false;
                flagsCount--;
            } else if (flagsCount < MINES_COUNT) {
                cell.isFlagged = true;
                flagsCount++;
            }
            updateCell(row, col);
            document.getElementById('flags-count').textContent = flagsCount;
        }
        function toggleFlagMode() {
            if (!isTouchDevice) return;
            flagMode = !flagMode;
            const btn = document.getElementById('flag-mode-btn');
            if (flagMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
        function revealCell(row, col) {
            const cell = board[row][col];
            if (cell.isRevealed || cell.isFlagged) return;
            cell.isRevealed = true;
            revealedCount++;
            if (cell.isMine) {
                gameOver = true;
                clearInterval(timerInterval);
                revealAllMines();
                showMessage('Game over! \u{1F4A5}', 'lose');
                return;
            }
            updateCell(row, col);
            if (cell.adjacentMines === 0) {
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const newRow = row + di;
                        const newCol = col + dj;
                        if (newRow >= 0 && newRow < BOARD_SIZE && 
                            newCol >= 0 && newCol < BOARD_SIZE) {  revealCell(newRow, newCol);
                        }
                    }
                }
            }
        }
        function updateCell(row, col) {
            const cell = board[row][col];
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cellElement.className = 'cell';
            cellElement.textContent = '';
            if (cell.isRevealed) {
                cellElement.classList.add('revealed');
                if (cell.isMine) {
                    cellElement.classList.add('mine', 'revealed');
                } else if (cell.adjacentMines > 0) {
                    cellElement.classList.add(`num-${cell.adjacentMines}`);
                    cellElement.textContent = cell.adjacentMines;
                }
            } else if (cell.isFlagged) {
                cellElement.classList.add('flagged');
            }
        }
        function revealAllMines() {
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (board[i][j].isMine) {       board[i][j].isRevealed = true;
                        updateCell(i, j);
                    }
                }
            }
        }
        function checkWin() {
            const totalCells = BOARD_SIZE * BOARD_SIZE;
            const safeCells = totalCells - MINES_COUNT;
            if (revealedCount === safeCells) {
                gameOver = true;
                clearInterval(timerInterval);
                showMessage('Congratulations! You win! \u{1F389}', 'win');
                for (let i = 0; i < BOARD_SIZE; i++) {
                    for (let j = 0; j < BOARD_SIZE; j++) {
                        if (board[i][j].isMine && !board[i][j].isFlagged) {  board[i][j].isFlagged = true;            updateCell(i, j);
                        }
                    }
                }
            }
        }
        function startTimer() {
            timerInterval = setInterval(() => {
                seconds++;
                document.getElementById('timer').textContent = seconds;
            }, 1000);
        }
        function showMessage(text, type) {
            const messageEl = document.getElementById('message');
            messageEl.textContent = text;
            messageEl.className = `message ${type} show`;
        }
        window.onload = initGame;
        ;(function(){
var icon = '<svg class="sg" xmlns="http://w3.org/2000/svg" viewBox="0 0 185.31 251.89"><path d="M66.8,144.17c0-66.24,22.46-113.9,80.72-112.32,81.48,1.7,80.72,46.8,80.72,112.32,0,5.15,8.38,3.81,7.62,19-2.28,19.42-9.44,14.63-10.39,19.85-9.26,51.8-40.65,88.67-77.95,88.67-37.76,0-69.47-38.53-78.28-90.58-.82-4.85-5.86-.8-6.42-18.68&& C61.47,146.7,66.8,149.7,66.8,144.17Z" transform="translate(-56.6 -25.84)" style="fill:#ffdfbf;fill-rule:evenodd"/><path d="M147.52,31.85C99.49,31.22,75.79,63,69,111.24c8.78-23.84,27.86-26,64.33-26.54,70.62-1.13,88.39,8.27,79.64,96.55-1.84,18.6-6.1,24.62-28.36,39.74-12.7,8.2,18.54-26.37-49.78-27-49.5-.43-30.6,36.41-40.6,29.44a81.88,81.88,0,0,1-20.28-20.73c12.89,40.76,40.76,69,73.8,69,37.3,0,68.69-37.59,77.95-88.67l2.77-38.89C228.24,77.93,229,32.91,147.52,31.85Z" transform="translate(-56.6 -25.84)" style="fill:#d0b57b;fill-rule:evenodd"/><path d="M146.13,31.84h1.39c81.48,1.7,80.72,46.8,80.72,112.33,0,5.15,8.38,3.81,7.62,19-2.28,19.42-9.44,14.63-10.39,19.85-9.26,51.8-40.65,88.67-77.95,88.67-37.76,0-69.47-38.53-78.28-90.58-.82-4.85-5.86-.8-6.42-18.68-1.34-16.39,4-13.39,4-18.29,0-65.71,22.11-112.33,79.33-112.33m0-6h0c-29.39,0-51.65,11.54-66.18,34.3C67.3,80,60.86,108.6,60.8,143.68h0c-2.54,3.5-4.94,7-4,19.12.4,12.11,2.72,16.46,6.59,19.86,9.65,56,44.19,95.7,84.11,95.7,19.91,0,38.59-9.42,54-27.25,14.35-16.57,24.87-39.79,29.66-65.45l0,0c4.22-2.57,8.87-6.53,10.58-21.1l0-.2v-.2c.58-11.55-3.35-16.18-7.7-19.61l-.53-.5v-1c0-33,0-61.46-10.76-82.11-12-23-36.9-33.89-75.88-34.41Z" transform="translate(-56.6 -25.84)" style="fill:#303030"/><path d="M118.31,183.29s4.28,4.28,12.84,4S143.67,182,143.67,182s-3.62,8.23-11.53,8.89S118.31,183.29,118.31,183.29Z" transform="translate(-56.6 -25.84)" style="fill:#bfa78f;fill-rule:evenodd"/><ellipse cx="44.24" cy="115.64" rx="28.15" ry="35.97" style="fill:#fff"/><ellipse cx="104.54" cy="115.64" rx="28.15" ry="35.97" style="fill:#fff"/><circle class="eye" id="eye-left" cx="35.9" cy="121.66" r="10.5" style="fill:#303030"/><circle class="eye" cx="94.57" cy="121.66" r="10.5" style="fill:#303030"/><path d="M140.74,236.63h0c-16.92,0-29.43-4.38-29.43-18.42h0c0-4.22,4.12-7.64,9.21-7.64H160c3.6,0,6.53,2.42,6.53,5.42v7.23C166.55,234.48,154.32,236.63,140.74,236.63Z" transform="translate(-56.6 -25.84)" style="fill:#2d251d;fill-rule:evenodd"/><path d="M160,210.57h-39.5c-5.9,0-9.21,3.42-9.21,7.64,0,.7,0,.15,0,.22,7.57,2.29,17.6,3.2,29,3.2h0c9.87,0,19.24-.52,26.25-2.36V216C166.55,213,163.62,210.57,160,210.57Z" transform="translate(-56.6 -25.84)" style="fill:#fff"/></svg>';
    document.head.insertAdjacentHTML('beforeend','<style>.sg { width: 35px; height: 35px; position: fixed; bottom: 10px; right: 10px; } .sg .eye { -webkit-transform: translateX(0px);   transform: translateX(0px); } .sg:hover .eye { -webkit-transition: -webkit-transform 0.2s ease; transition: -webkit-transform 0.2s ease; transition: transform 0.2s ease; transition: transform 0.2s ease, -webkit-transform 0.2s ease; -webkit-transform: translateX(12px);   transform: translateX(12px); }</style>');
    var a = document.createElement('a');
    a.setAttribute('href','http://KenDevel0per.github.io/');
    a.setAttribute('target','_blank');
    a.innerHTML = icon;
    document.body.appendChild(a);
})();
