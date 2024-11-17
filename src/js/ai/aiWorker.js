// aiWorker.js
importScripts('ai.js');
importScripts('../winCheck.js');
let Turns = {
    Player1: 1,
    Player2: 2,
}

self.addEventListener('message', function(e) {
    const { state, depth, weights } = e.data;

    const root = new TreeNode(state);
    minimax(root, depth, -Infinity, Infinity, true, weights);

    // Find the best move
    let bestMove = null;
    let bestScore = -Infinity;
    for (const child of root.children) {
        if (child.score > bestScore) {
            bestScore = child.score;
            bestMove = child.move;
        }
    }

    self.postMessage(bestMove);
});