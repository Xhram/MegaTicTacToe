let weights = {
    win: 25,
    lose: -500,
    miniBoardWin: 5,
    miniBoardLose: -20,
    winCenterMiniBoard: 10,
    loseCenterMiniBoard: -50,

}


class TreeNode {
    constructor(state, move = null, parent = null) {
        this.state = state;
        this.move = move;
        this.parent = parent;
        this.children = [];
        this.score = null;
    }
}


function minimax(node, depth, alpha, beta, maximizingPlayer, weights) {
    if (depth === 0 || isTerminal(node.state)) {
        return evaluate(node.state, weights);
    }

    const moves = getPossibleMoves(node.state);
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const childState = applyMove(node.state, move);
            const childNode = new TreeNode(childState, move, node);
            node.children.push(childNode);
            const eval = minimax(childNode, depth - 1, alpha, beta, false, weights);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) {
                break; // Beta cut-off
            }
        }
        node.score = maxEval;
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const childState = applyMove(node.state, move);
            const childNode = new TreeNode(childState, move, node);
            node.children.push(childNode);
            const eval = minimax(childNode, depth - 1, alpha, beta, true, weights);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) {
                break; // Alpha cut-off
            }
        }
        node.score = minEval;
        return minEval;
    }
}

function evaluate(state, weights) {
    const player = state.turn === Turns.Player1 ? 'X' : 'O';
    const opponent = player === 'X' ? 'O' : 'X';
    let score = 0;

    const overallWinner = checkWholeGameWin_AI(state.board);
    if (overallWinner === player) {
        return weights.win;
    } else if (overallWinner === opponent) {
        return weights.lose;
    }

    // Evaluate each mini-board
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const miniBoardObj = state.board[i][j];
            const miniBoard = miniBoardObj.miniGrid;
            const miniWinner = checkWin(miniBoard);

            if (miniWinner === player) {
                score += weights.miniBoardWin;
            } else if (miniWinner === opponent) {
                score += weights.miniBoardLose;
            }

            if (i === 1 && j === 1) {
                // Center mini-board bonus
                if (miniWinner === player) {
                    score += weights.winCenterMiniBoard;
                } else if (miniWinner === opponent) {
                    score += weights.loseCenterMiniBoard;
                }
            }
        }
    }

    return score;
}

function isTerminal(state) {
    return checkWholeGameWin_AI(state.board) !== null || getPossibleMoves(state).length === 0;
}

function applyMove(state, move) {
    const newState = JSON.parse(JSON.stringify(state));
    const playerSymbol = state.turn === Turns.Player1 ? 'X' : 'O';

    // Update mini-board
    const miniBoard = newState.board[move.boardRow][move.boardCol].miniGrid;
    miniBoard[move.cellRow][move.cellCol] = playerSymbol;

    // Check for mini-board win
    if (checkWin(miniBoard) === playerSymbol) {
        newState.board[move.boardRow][move.boardCol].winner = playerSymbol;
    }

    // Update last played cell
    newState.lastPlayedCell = {
        boardRow: move.boardRow,
        boardCol: move.boardCol,
        cellRow: move.cellRow,
        cellCol: move.cellCol
    };

    // Switch turn
    newState.turn = state.turn === Turns.Player1 ? Turns.Player2 : Turns.Player1;

    return newState;
}

function getPossibleMoves(state) {
    const moves = [];
    const activeBoards = getActiveBoards(state);

    activeBoards.forEach(([boardRow, boardCol]) => {
        const miniBoard = state.board[boardRow][boardCol];
        if (miniBoard.winner || miniBoard.isScratch) {
            // If the mini-board is won or scratched, you can override any piece
            for (let cellRow = 0; cellRow < 3; cellRow++) {
                for (let cellCol = 0; cellCol < 3; cellCol++) {
                    moves.push({
                        boardRow,
                        boardCol,
                        cellRow,
                        cellCol
                    });
                }
            }
        } else {
            // Only select empty cells
            for (let cellRow = 0; cellRow < 3; cellRow++) {
                for (let cellCol = 0; cellCol < 3; cellCol++) {
                    if (!miniBoard.miniGrid[cellRow][cellCol]) {
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
    });

    return moves;
}

function getActiveBoards(state) {
    const lastMove = state.lastPlayedCell;
    const activeBoards = [];

    if (lastMove) {
        const boardRow = lastMove.cellRow;
        const boardCol = lastMove.cellCol;
        const targetBoard = state.board[boardRow][boardCol];

        if (targetBoard.winner || targetBoard.isScratch) {
            // Any board can be played on
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    activeBoards.push([i, j]);
                }
            }
        } else {
            activeBoards.push([boardRow, boardCol]);
        }
    } else {
        // First move; all boards are available
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                activeBoards.push([i, j]);
            }
        }
    }

    return activeBoards;
}

function checkWholeGameWin_AI(bigBoard) {
    // Create a 3x3 array to represent the overall board status
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

    // Check for a winner on the overall board
    const winner = checkWin(boardData);
    if (winner !== "") {
        return winner;
    }

    // Check for a total scratch (all mini-boards are won or scratched)
    let xWins = 0;
    let oWins = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = bigBoard[i][j];
            if (cell.winner === 'X') xWins++;
            if (cell.winner === 'O') oWins++;
        }
    }

    // If all mini-boards are won or scratched, determine the winner based on the number of wins
    if (xWins + oWins === 9) {
        if (xWins > oWins) return 'X';
        if (oWins > xWins) return 'O';
    }

    return null;
}