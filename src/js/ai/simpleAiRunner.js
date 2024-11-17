const MAX_WORKERS = navigator.hardwareConcurrency || 4;
const workerPool = [];
let availableWorkers = [];

for (let i = 0; i < MAX_WORKERS; i++) {
    const worker = new Worker('src/js/ai/aiWorker.js');
    workerPool.push(worker);
    availableWorkers.push(worker);
}

function runAI(depth) {
    const state = gameStateToJSON();
    const weights = {
        win: 1000,
        lose: -1000,
        miniBoardWin: 100,
        miniBoardLose: -100,
        winCenterMiniBoard: 50,
        loseCenterMiniBoard: -50,
    };

    const possibleMoves = getPossibleMoves(state);
    let bestMove = null;
    let bestScore = -Infinity;
    let completed = 0;

    return new Promise((resolve) => {
        possibleMoves.forEach((move) => {
            if (availableWorkers.length === 0) {
                // Wait for an available worker
                const interval = setInterval(() => {
                    if (availableWorkers.length > 0) {
                        clearInterval(interval);
                        assignMoveToWorker(move);
                    }
                }, 10);
            } else {
                assignMoveToWorker(move);
            }
        });

        function assignMoveToWorker(move) {
            const worker = availableWorkers.pop();
            worker.onmessage = function(e) {
                const { move: returnedMove, score } = e.data;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = returnedMove;
                }
                availableWorkers.push(worker);
                completed++;
                if (completed === possibleMoves.length) {
                    resolve(bestMove);
                }
            };
            worker.postMessage({ state, depth, weights, move });
        }
    }).then((bestMove) => {
        applyBestMove(bestMove);
    });
}


function applyBestMove(move) {
    // Update the game state and UI with the AI's move
    const boardNumber = move.boardRow * 3 + move.boardCol + 1;
    const cellNumber = move.cellRow * 3 + move.cellCol + 1;
    clickedCell(boardNumber, cellNumber);
}