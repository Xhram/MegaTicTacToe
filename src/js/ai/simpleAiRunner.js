const MAX_WORKERS = navigator.hardwareConcurrency || 4;
const workerPool = [];
let availableWorkers = [];

// Initialize the worker pool
for (let i = 0; i < MAX_WORKERS; i++) {
    createWorker();
}

function createWorker() {
    const worker = new Worker('src/js/ai/aiWorker.js');
    worker.onmessage = handleWorkerMessage;
    availableWorkers.push(worker);
}

let moveResults = [];
let totalMoves = 0;
let resolvePromise;

// Handle messages from workers
function handleWorkerMessage(e) {
    const { move, score } = e.data;
    moveResults.push({ move, score });
    totalMoves--;

    // Return the worker to the pool
    availableWorkers.push(this);

    if (totalMoves === 0) {
        // Find the best move
        let bestMove = null;
        let bestScore = -Infinity;
        moveResults.forEach(result => {
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = result.move;
            }
        });
        moveResults = [];
        resolvePromise(bestMove);
    }
}
// Run AI with optimized RAM usage
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
    if (possibleMoves.length === 0) {
        return;
    }

    totalMoves = possibleMoves.length;
    moveResults = [];

    return new Promise((resolve) => {
        resolvePromise = resolve;
        possibleMoves.forEach((move) => {
            if (availableWorkers.length > 0) {
                const worker = availableWorkers.pop();
                worker.postMessage({ state, depth, weights, move });
            } else {
                const tempWorker = new Worker('src/js/ai/aiWorker.js');
                tempWorker.onmessage = function(e) {
                    const { move, score } = e.data;
                    moveResults.push({ move, score });
                    totalMoves--;

                    tempWorker.terminate();

                    if (totalMoves === 0) {
                        finalizeBestMove(resolve);
                    }
                };
                tempWorker.postMessage({ state, depth, weights, move });
            }
        });
    }).then((bestMove) => {
        if (bestMove) {
            applyBestMove(bestMove);
        }
    });
}

function finalizeBestMove(resolve) {
    // Find the best move
    let bestMove = null;
    let bestScore = -Infinity;
    moveResults.forEach(result => {
        if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = result.move;
        }
    });
    moveResults = [];
    resolve(bestMove);
}


function applyBestMove(move) {
    // Update the game state and UI with the AI's move
    const boardNumber = move.boardRow * 3 + move.boardCol + 1;
    const cellNumber = move.cellRow * 3 + move.cellCol + 1;
    clickedCell(boardNumber, cellNumber);
}