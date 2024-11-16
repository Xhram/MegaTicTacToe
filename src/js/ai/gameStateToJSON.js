function gameStateToJSON() {
    const boards = Array.from(document.querySelectorAll('.board')).sort((a, b) => {
        const getIdNumber = (board) => parseInt(board.id.replace('board', ''));
        return getIdNumber(a) - getIdNumber(b);
    });
    const bigGrid = [[], [], []];
    
    boards.forEach(board => {
        const boardNumber = parseInt(board.id.replace('board', '')) - 1;
        const row = Math.floor(boardNumber / 3);
        const col = boardNumber % 3;
        const cells = board.querySelectorAll('.cell');
        const miniGrid = [[], [], []];
        let full = true;
        cells.forEach(cell => {
            const cellIndex = parseInt(cell.id.split('-')[1]) - 1;
            const cellRow = Math.floor(cellIndex / 3);
            const cellCol = cellIndex % 3;
            if(cell.textContent.trim() === ''){
                full = false;
            }
            miniGrid[cellRow][cellCol] = cell.textContent.trim() || null;
        });
        
        bigGrid[row][col] = {miniGrid, isScratch: full, winner: board.classList.contains('won') ? board.querySelector('.windisplay').innerHTML : null};
    });
    let lastPlayedCell = null;
    const lastCell = document.querySelector('.cell.markX, .cell.markO');

    if (lastCell) {
        const cellIndex = parseInt(lastCell.id.split('-')[1]) - 1;
        const cellRow = Math.floor(cellIndex / 3);
        const cellCol = cellIndex % 3;

        const board = lastCell.closest('.board');
        const boardNumber = parseInt(board.id.replace('board', '')) - 1;
        const boardRow = Math.floor(boardNumber / 3);
        const boardCol = boardNumber % 3;

        lastPlayedCell = {
            boardRow: boardRow,
            boardCol: boardCol,
            cellRow: cellRow,
            cellCol: cellCol
        };
    }
    return {board:bigGrid,turn:turn,lastPlayedCell:lastPlayedCell};
}

