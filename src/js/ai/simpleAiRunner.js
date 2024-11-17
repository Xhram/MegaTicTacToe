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

    const aiWorker = new Worker('src/js/ai/aiWorker.js');
    aiWorker.postMessage({ state, depth, weights });

    aiWorker.onmessage = function(e) {
        const bestMove = e.data;
        // Apply the best move in your game
        applyBestMove(bestMove);
        aiWorker.terminate();
    };
}
function applyBestMove(move) {
    // Update the game state and UI with the AI's move
    const boardNumber = move.boardRow * 3 + move.boardCol + 1;
    const cellNumber = move.cellRow * 3 + move.cellCol + 1;
    clickedCell(boardNumber, cellNumber);
}