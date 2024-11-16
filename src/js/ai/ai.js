let weights = {
    win: 25,
    lose: -25,
    minBoardWin: 7,
    minBoardLose: -7,

}


function findBestMoves(gameState, depth) {
    const player = gameState.turn === Turns.Player1 ? 'X' : 'O';
    const opponent = player === 'X' ? 'O' : 'X';

    let bestValue = -Infinity;
    let bestMoves = [];

    const possibleMoves = getPossibleMoves(gameState);

    for (const move of possibleMoves) {
        makeMove(gameState, move, player);
        const moveValue = minimax(gameState, depth - 1, false, -Infinity, Infinity, player, opponent);
        undoMove(gameState, move);
        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMoves = [move];
        } else if (moveValue === bestValue) {
            bestMoves.push(move);
        }
    }

    return bestMoves;
}

function minimax(gameState, depth, isMaximizing, alpha, beta, player, opponent) {
    const winner = checkWholeGameWin_AI(gameState.board);
    if (depth === 0 || winner) {
        return evaluate(gameState, winner, player, opponent);
    }

    const possibleMoves = getPossibleMoves(gameState);

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of possibleMoves) {
            makeMove(gameState, move, player);
            const eval = minimax(gameState, depth - 1, false, alpha, beta, player, opponent);
            undoMove(gameState, move);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of possibleMoves) {
            makeMove(gameState, move, opponent);
            const eval = minimax(gameState, depth - 1, true, alpha, beta, player, opponent);
            undoMove(gameState, move);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluate(gameState, winner, player, opponent) {
    if (winner === player) {
        return weights.win;
    } else if (winner === opponent) {
        return weights.lose;
    } else {
        let score = 0;
        // Evaluate mini boards
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const miniBoardObj = gameState.board[i][j];
                const miniBoard = miniBoardObj.miniGrid;
                const miniWinner = miniBoardObj.winner;
                if (miniWinner === player) {
                    score += weights.minBoardWin;
                } else if (miniWinner === opponent) {
                    score += weights.minBoardLose;
                } else if (miniBoardObj.isScratch) {
                    // Additional logic if needed
                } else {
                    // Evaluate intermediate positions
                    score += evaluateMiniBoard(miniBoard, player, opponent);
                }
            }
        }
        return score;
    }
}

function evaluateMiniBoard(miniBoard, player, opponent) {
    let score = 0;
    const lines = [
        // Rows
        [[0,0], [0,1], [0,2]],
        [[1,0], [1,1], [1,2]],
        [[2,0], [2,1], [2,2]],
        // Columns
        [[0,0], [1,0], [2,0]],
        [[0,1], [1,1], [2,1]],
        [[0,2], [1,2], [2,2]],
        // Diagonals
        [[0,0], [1,1], [2,2]],
        [[0,2], [1,1], [2,0]],
    ];

    for (const line of lines) {
        let playerCount = 0;
        let opponentCount = 0;
        for (const [x, y] of line) {
            const cell = miniBoard[x][y];
            if (cell === player) {
                playerCount++;
            } else if (cell === opponent) {
                opponentCount++;
            }
        }
        if (playerCount > 0 && opponentCount === 0) {
            score += Math.pow(10, playerCount);
        } else if (opponentCount > 0 && playerCount === 0) {
            score -= Math.pow(10, opponentCount);
        }
    }
    return score;
}

function getPossibleMoves(gameState) {
    const moves = [];
    const activeBoards = getActiveBoards(gameState);
    for (const [boardRow, boardCol] of activeBoards) {
        const miniBoardObj = gameState.board[boardRow][boardCol];
        const miniBoard = miniBoardObj.miniGrid;
        for (let cellRow = 0; cellRow < 3; cellRow++) {
            for (let cellCol = 0; cellCol < 3; cellCol++) {
                const cellValue = miniBoard[cellRow][cellCol];
                if (
                    !cellValue ||
                    (miniBoardObj.isScratch && !miniBoardObj.winner)
                ) {
                    moves.push({
                        boardRow,
                        boardCol,
                        cellRow,
                        cellCol
                    });
                }
            }
        }
    }
    return moves;
}

function getActiveBoards(gameState) {
    const lastMove = gameState.lastPlayedCell;
    const activeBoards = [];
    if (lastMove) {
        let boardRow = lastMove.cellRow;
        let boardCol = lastMove.cellCol;
        const targetBoard = gameState.board[boardRow][boardCol];
        if (targetBoard.winner || targetBoard.isScratch) {
            // The target board is won or scratched; any board can be played on
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const board = gameState.board[i][j];
                    if (!board.winner && !board.isScratch) {
                        activeBoards.push([i, j]);
                    }
                }
            }
        } else {
            activeBoards.push([boardRow, boardCol]);
        }
    } else {
        // First move; all boards are available
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const board = gameState.board[i][j];
                if (!(board.winner && !board.isScratch)) {
                    activeBoards.push([i, j]);
                }
            }
        }
    }
    return activeBoards;
}

function makeMove(gameState, move, player) {
    const board = gameState.board[move.boardRow][move.boardCol];
    if (board.isScratch && !board.winner) {
        // Can override any piece
        board.miniGrid[move.cellRow][move.cellCol] = player;
    } else {
        board.miniGrid[move.cellRow][move.cellCol] = player;
    }
    // Update winner or isScratch for the mini board
    const miniWinner = checkWin(board.miniGrid);
    if (miniWinner !== "") {
        board.winner = miniWinner;
    } else if (isMiniBoardFull(board.miniGrid)) {
        board.isScratch = true;
    }
    gameState.lastPlayedCell = {
        cellRow: move.cellRow,
        cellCol: move.cellCol
    };
    gameState.turn = gameState.turn === Turns.Player1 ? Turns.Player2 : Turns.Player1;
}

function undoMove(gameState, move) {
    const board = gameState.board[move.boardRow][move.boardCol];
    board.miniGrid[move.cellRow][move.cellCol] = null;
    // Reset winner and isScratch if necessary
    board.winner = null;
    board.isScratch = false;
    gameState.lastPlayedCell = null;
    gameState.turn = gameState.turn === Turns.Player1 ? Turns.Player2 : Turns.Player1;
}

function isMiniBoardFull(miniGrid) {
    for (let row of miniGrid) {
        if (row.includes(null)) return false;
    }
    return true;
}

function checkWholeGameWin_AI(bigBoard) {
    const boardData = [];
    for (let i = 0; i < 3; i++) {
        boardData.push([]);
        for (let j = 0; j < 3; j++) {
            const cell = bigBoard[i][j];
            if (cell.winner) {
                boardData[i][j] = cell.winner;
            } else {
                boardData[i][j] = "";
            }
        }
    }
    const winner = checkWin(boardData);
    if (winner !== "") {
        return winner;
    }
    // Check for total scratch
    let xWins = 0;
    let oWins = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = bigBoard[i][j];
            if (cell.winner === 'X') xWins++;
            if (cell.winner === 'O') oWins++;
        }
    }
    if (xWins + oWins === 9) {
        if (xWins > oWins) return 'X';
        if (oWins > xWins) return 'O';
    }
    return null;
}

// Use the existing checkWin function
// function checkWin(board) { ... } // Provided in winCheck.js

// Helper function to clone game state (deep clone)
function cloneGameState(gameState) {
    return JSON.parse(JSON.stringify(gameState));
}
