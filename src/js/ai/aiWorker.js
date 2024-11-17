importScripts('ai.js');
importScripts('../winCheck.js');

let Turns = {
    Player1: 1,
    Player2: 2,
};

self.addEventListener('message', function(e) {
    const { state, depth, move } = e.data;

    // Compute the score for the provided move
    const childState = applyMove(state, move);

    //const score = minimax(childState, depth - 1,  -Infinity, evaluate(state) + 2000, true);

    const score = findBestMoveBasedOnAverageScore(childState, depth - 1) / totalChecked;

    // Post the move and its score back to the main thread

    self.postMessage({ move, score, totalChecked_: totalChecked, wins_: wins });

});