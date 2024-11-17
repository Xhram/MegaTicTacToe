importScripts('ai.js');
importScripts('../winCheck.js');

let Turns = {
    Player1: 1,
    Player2: 2,
};

self.addEventListener('message', function(e) {
    const { state, depth, weights, move } = e.data;

    // Apply the initial move if provided
    let currentState = state;
    if (move) {
        currentState = applyMove(state, move);
    }

    const root = new TreeNode(currentState);
    const score = minimax(root, depth, -Infinity, Infinity, true, weights);

    self.postMessage({ move, score });
});