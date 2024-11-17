importScripts('ai.js');
importScripts('../winCheck.js');

let Turns = {
    Player1: 1,
    Player2: 2,
};

self.addEventListener('message', function(e) {
    const { state, depth, weights, move } = e.data;

    // Compute the score for the provided move
    const childState = applyMove(state, move);
    const score = minimax(childState, depth - 1, -Infinity, Infinity, false, weights);

    // Post the move and its score back to the main thread
    self.postMessage({ move, score });

    // Terminate the worker to free up resources
    self.close();
});