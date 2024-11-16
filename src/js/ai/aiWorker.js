importScripts('ai.js'); 
importScripts('../winCheck.js'); 
let Turns = {
    Player1: 1,
    Player2: 2,
}

self.onmessage = function(event) {
    const { gameState, move, depth, player, opponent } = event.data;
    makeMove(gameState, move, player);
    const moveValue = minimax(gameState, depth - 1, false, -Infinity, Infinity, player, opponent);
    undoMove(gameState, move);
    self.postMessage({ move, moveValue });
};