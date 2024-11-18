importScripts('ai.js');
importScripts('../winCheck.js');

let Turns = {
    Player1: 1,
    Player2: 2,
};

let rootNode = null;

self.addEventListener('message', function (e) {
    const { type, data } = e.data;
    if (type === 'init') {
        rootNode = new TreeNode(data);
        return;
    }
    if (type === 'run') {
        for(let i = 0; i < data.interations; i++){
            rootNode.runMonteCarloTreeSearch();
    
        }
        console.log(`Ran ${data.interations} iterations`);
        return;
    }
    if(type === 'bestMove'){
        console.log('bestMove');
        console.log(rootNode);
        const bestMove = rootNode.getChildWithBestWinRate();
        rootNode.children = [];
        rootNode = bestMove;
        rootNode.parent = null;
        self.postMessage({ type: "move", move: bestMove.move });
        
        return;
    }
    if(type === "playMove"){

        const move = data;
        const child = rootNode.children.find((child) => {
            return child.move.boardRow === move.boardRow && child.move.boardCol === move.boardCol && child.move.cellRow === move.cellRow && child.move.cellCol === move.cellCol;
        });
        if(child){
            rootNode.children = [];
            rootNode = child;
            rootNode.parent = null;
        }
        return;
    }
    if (type === 'debug') {
        console.log(rootNode);
        return;
    }
    if (type === "passBackRootNode") {
        self.postMessage({ type:"passBack", rootNode: rootNode });
        return;
    }


});

function notStopSimulating() {
    console.log('notStopSimulating');
    for(let i = 0; i < 1000; i++){
        rootNode.runMonteCarloTreeSearch();

    }
}