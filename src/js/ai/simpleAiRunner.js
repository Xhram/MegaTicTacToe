const MAX_WORKERS = navigator.hardwareConcurrency || 4;
const workerPool = [];
let availableWorkers = [];

// Initialize the worker pool based on CPU threads
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
    const { move, score, totalChecked_, wins_} = e.data;
    moveResults.push({ move, score });
    totalMoves--;
    totalChecked += totalChecked_;
    wins += wins_;

    // Return the worker to the pool
    availableWorkers.push(this);
    console.log(totalMoves + " to check")
    if (totalMoves === 0) {
        finalizeBestMove(resolvePromise);
    } else {
        assignNextMove();
    }
}

// Queue of pending moves
let moveQueue = [];

// Run AI with optimized worker utilization
function runAI(searchDepth) {
    totalChecked = 0;
    wins = 0;
    window.searchDepth = searchDepth;
    const state = gameStateToJSON();

    const possibleMoves = getPossibleMoves(state);
    if (possibleMoves.length === 0) {
        return;
    }

    moveQueue = [...possibleMoves];
    totalMoves = moveQueue.length;
    moveResults = [];

    return new Promise((resolve) => {
        resolvePromise = resolve;
        // Assign initial moves to available workers
        for (let i = 0; i < MAX_WORKERS && moveQueue.length > 0; i++) {
            assignNextMove();
        }
    }).then((bestMove) => {
        if (bestMove) {
            applyBestMove(bestMove);
        }
    });
}

function assignNextMove() {
    if (moveQueue.length === 0 || availableWorkers.length === 0) {
        return;
    }

    const worker = availableWorkers.pop();
    const move = moveQueue.shift();
    worker.postMessage({ state: gameStateToJSON(), depth: window.searchDepth, weights: weights, move });
}

function finalizeBestMove(resolve) {
    // Find the best move
    let bestMove = null;
    let bestScore = -Infinity;
    window.out_moveResults = [...moveResults]
    moveResults.forEach(result => {
        if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = result.move;
        }
    });
    moveResults = [];
    console.log("Total moves checked: " + totalChecked);
    console.log("Total moves won: " + wins);

    resolve(bestMove);
}

function applyBestMove(move) {
    // Update the game state and UI with the AI's move
    const boardNumber = move.boardRow * 3 + move.boardCol + 1;
    const cellNumber = move.cellRow * 3 + move.cellCol + 1;
    clickedCell(boardNumber, cellNumber);
}