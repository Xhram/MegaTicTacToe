
let rootNode = new TreeNode(gameStateToJSON(),null,null)
console.log(rootNode)



let worker = new Worker('src/js/ai/aiWorker.js'); 

worker.onmessage = handleResult;
worker.postMessage({ type: "init", data: rootNode });


function runAI(interations) {
    worker.postMessage({ type: "run", data: {interations:interations} });
}

function handleResult(event) {
    window.eventData = event.data;

    if (event.data.type === "move") {
        applyBestMove(event.data.move);

    }
    if (event.data.type === "passBack") {
        rootNode = event.data.rootNode;
        worker.terminate();
        worker = new Worker('src/js/ai/aiWorker.js');
        worker.onmessage = handleResult;
        worker.postMessage({ type: "init", data: rootNode });
    }
    console.log(event.data);
}






function applyBestMove(move) {
    // Update the game state and UI with the AI's move
    const boardNumber = move.boardRow * 3 + move.boardCol + 1;
    const cellNumber = move.cellRow * 3 + move.cellCol + 1;
    clickedCell(boardNumber, cellNumber);
}