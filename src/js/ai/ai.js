

class TreeNode {
    children;
    parent;
    state;
    move;
    posibleMovesNotSimulated;
    isTerminal;
    isLeafNode;
    totalPlayouts;
    totalWins;



    constructor(...args){ 
        if(args.length == 1){
            let json = args[0];
            this.parent = json.parent;
            this.state = json.state;
            this.move = json.move;
            this.posibleMovesNotSimulated = json.posibleMovesNotSimulated;
            this.isTerminal = json.isTerminal;
            this.isLeafNode = json.isLeafNode;
            this.totalPlayouts = json.totalPlayouts;
            this.totalWins = json.totalWins;
            this.children = [];
            if(json.children.length){
                for(let i = 0; i < json.children.length; i++){
                    this.children.push(new TreeNode(json.children[i]));
                }
            }
        } else {
            let state = args[0];
            let parent = args[1];
            let move = args[2];
            let shouldCloneState = args[3] || false;
            this.isLeafNode = true;
            this.totalPlayouts = 0;
            this.totalWins = 0;
            this.children = [];
            this.parent = parent;
            this.move = move;
            if(move != undefined){
                if(shouldCloneState){
                    this.state = applyMoveClone(state,move); 

                } else {
                    this.state = applyMove(state,move);
                }
            } else {
                if(shouldCloneState){
                    this.state = structuredClone(state);

                } else {
                    this.state = state;
                }
            }
            this.isTerminal = checkWholeGameWin_AI(this.state.board) != "";
            if(!this.isTerminal){
                this.posibleMovesNotSimulated = getPossibleMoves(this.state);
            } else {
                this.posibleMovesNotSimulated = [];
            }
        }
    }
    
    runMonteCarloTreeSearch(){
        

        //Selection
        let selectedNode = this;
        while(!selectedNode.isLeafNode){
            selectedNode = selectedNode.selectBestChild();
        }


        //Expansion
        if(selectedNode.totalPlayouts > 0 && selectedNode.isTerminal == false){
            let nextSelectedNode = selectedNode.expandAllMoves(true)[0];
            selectedNode.state = undefined;
            selectedNode = nextSelectedNode;

        }
        


        //Simulation / Rollout


        let currentState = structuredClone(selectedNode.state);
        let winner = checkWholeGameWin_AI(currentState.board);
        let isTerminal = winner != "";

        //Clear that state to save memory because this is an end game
        if(isTerminal){
            selectedNode.state = undefined;
        }


        while(!isTerminal){
            let moves = getPossibleMoves(currentState);
            if(moves.length == 0){
                console.log("No moves left");
                console.log(currentState);
                console.log(JSON.stringify(currentState));
            }
            currentState = applyMove(currentState,selectRandomItemFromArray(moves));
            winner = checkWholeGameWin_AI(currentState.board);
            isTerminal = winner != "";
        }

        //Backpropagation
        let didAIWin = winner == "O";
        while(selectedNode != null){
            selectedNode.totalPlayouts++;
            if(didAIWin){
                selectedNode.totalWins++;
            }
            selectedNode = selectedNode.parent;
        }
    }
    selectBestChild(){
        return this.children.reduce((a,b)=>a.getUCTValue() > b.getUCTValue() ? a : b);
    }

    getUCTValue(explorationParameter = 1.4142){
        if(this.totalPlayouts == 0){
            return Infinity;
        }
        if (this.parent == null) {
			return this.totalWins / this.totalPlayouts;
		}
        return this.totalWins/this.totalPlayouts + explorationParameter * Math.sqrt(Math.log(this.parent.totalPlayouts)/this.totalPlayouts);
    }

    selectRandomMove(){
        let randomChildIndex = Math.floor(Math.random() * this.children.length);
        return this.children[randomChildIndex];
    }
    expandAllMoves(noCloneOnFirstMove = false){
        let newNodes = [];
        while(this.posibleMovesNotSimulated.length > 0){
            if(newNodes.length == 0 && noCloneOnFirstMove){
                newNodes.push(this.expandMovePop(false));
            } else {
                newNodes.push(this.expandMovePop(true));
            }
        }
        return newNodes;
    }
    expandMovePop(shouldCloneState){
        let move = this.posibleMovesNotSimulated.pop();
        let newTreeNode = new TreeNode(this.state,this,move,shouldCloneState);
        this.children.push(newTreeNode);
        this.isLeafNode = false;
        return newTreeNode;
    }

    expandNNumberOfRandomMoves(n){
        let numberOfNewNodes = Math.min(n,this.posibleMovesNotSimulated.length);
        let newNodes = [];
        for(let i = 0; i < numberOfNewNodes; i++){
            newNodes.push(this.expandRandomMove());
        }
        return newNodes;
    }

    expandRandomMove(){
        let randomMoveIndex = Math.floor(Math.random() * this.posibleMovesNotSimulated.length);
        let newTreeNode = new TreeNode(this.state,this,this.posibleMovesNotSimulated[randomMoveIndex]);
        this.children.push(newTreeNode);
        this.posibleMovesNotSimulated.splice(randomMoveIndex,1);
        this.isLeafNode = false;
        return newTreeNode;
    }

    getChildWithBestWinRate(){
        return this.children.reduce((a,b)=>a.getWinRate() > b.getWinRate() ? a : b);
    }
    getChildWithMostSims(){
        return this.children.reduce((a,b)=>a.totalPlayouts > b.totalPlayouts ? a : b);
    }

    getWinRate(){
        if(this.totalPlayouts == 0){return 0;}
        return this.totalWins/this.totalPlayouts;
    }
    
}
function selectRandomItemFromArray(array){
    return array[Math.floor(Math.random() * array.length)];
}


function getPossibleMoves(state) {
    const moves = [];
    const activeBoards = getActiveBoards(state);

    activeBoards.forEach(([boardRow, boardCol]) => {
        const miniBoard = state.board[boardRow][boardCol];
        if (miniBoard.isScratch) {
            // If the mini-board is  scratched, you can override any piece
            for (let cellRow = 0; cellRow < 3; cellRow++) {
                for (let cellCol = 0; cellCol < 3; cellCol++) {
                    moves.push({
                        boardRow,
                        boardCol,
                        cellRow,
                        cellCol
                    });
                }
            }
        } else {
            // Only select empty cells
            for (let cellRow = 0; cellRow < 3; cellRow++) {
                for (let cellCol = 0; cellCol < 3; cellCol++) {
                    if (!miniBoard.miniGrid[cellRow][cellCol]) {
                        moves.push({
                            boardRow,
                            boardCol,
                            cellRow,
                            cellCol
                        });
                    }
                }
            }
        }
    });

    return moves;
}

function getActiveBoards(state) {
    const lastMove = state.lastPlayedCell;
    const activeBoards = [];

    if (lastMove) {
        const boardRow = lastMove.cellRow;
        const boardCol = lastMove.cellCol;
        const targetBoard = state.board[boardRow][boardCol];

        if (targetBoard.winner) {
            // Any board can be played on
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    activeBoards.push([i, j]);
                }
            }
        } else {
            activeBoards.push([boardRow, boardCol]);
        }
    } else {
        // First move; all boards are available
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                activeBoards.push([i, j]);
            }
        }
    }

    return activeBoards;
}

function checkWholeGameWin_AI(bigBoard) {
    // Create a 3x3 array to represent the overall board status
    const boardData = [];
    for (let i = 0; i < 3; i++) {
        boardData.push([]);
        for (let j = 0; j < 3; j++) {
            const cell = bigBoard[i][j];
            if (cell.winner) {
                boardData[i][j] = cell.winner;
            } else {
                boardData[i][j] = "";
            }
        }
    }

    // Check for a winner on the overall board
    const winner = checkWin(boardData);
    if (winner !== "") {
        return winner;
    }

    // Check for a total scratch (all mini-boards are won or scratched)
    let xWins = 0;
    let oWins = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = bigBoard[i][j];
            if (cell.winner === 'X') xWins++;
            if (cell.winner === 'O') oWins++;
        }
    }

    // If all mini-boards are won or scratched, determine the winner based on the number of wins
    if (xWins + oWins === 9) {
        if (xWins > oWins) return 'X';
        if (oWins > xWins) return 'O';
    }

    return "";
}

function applyMoveClone(state, move) {
    const newState = structuredClone(state);
    const playerSymbol = state.turn === Turns.Player1 ? 'X' : 'O';

    // Update mini-board
    const miniBoard = newState.board[move.boardRow][move.boardCol].miniGrid;
    miniBoard[move.cellRow][move.cellCol] = playerSymbol;

    // Check for mini-board win
    if (checkWin(miniBoard) === playerSymbol) {
        newState.board[move.boardRow][move.boardCol].winner = playerSymbol;
    }

    // Update last played cell
    newState.lastPlayedCell = {
        boardRow: move.boardRow,
        boardCol: move.boardCol,
        cellRow: move.cellRow,
        cellCol: move.cellCol
    };

    // Switch turn
    newState.turn = state.turn === Turns.Player1 ? Turns.Player2 : Turns.Player1;

    return newState;
}
function applyMove(state, move) {
    const playerSymbol = state.turn === Turns.Player1 ? 'X' : 'O';

    // Update mini-board
    const miniBoard = state.board[move.boardRow][move.boardCol].miniGrid;
    miniBoard[move.cellRow][move.cellCol] = playerSymbol;

    // Check for mini-board win
    if (checkWin(miniBoard) === playerSymbol) {
        state.board[move.boardRow][move.boardCol].winner = playerSymbol;
    }

    // Update last played cell
    state.lastPlayedCell = {
        boardRow: move.boardRow,
        boardCol: move.boardCol,
        cellRow: move.cellRow,
        cellCol: move.cellCol
    };

    // Switch turn
    state.turn = state.turn === Turns.Player1 ? Turns.Player2 : Turns.Player1;

    return state;
}
function checkScratch(miniBoard) {
    // Check if all cells are filled
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (!miniBoard[row][col]) {
                return false;
            }
        }
    }
    return true;
}

function applyMoveClone(state, move) {
    const newState = structuredClone(state);
    const playerSymbol = state.turn === Turns.Player1 ? 'X' : 'O';

    // Update mini-board
    const miniBoard = newState.board[move.boardRow][move.boardCol].miniGrid;
    miniBoard[move.cellRow][move.cellCol] = playerSymbol;

    // Check for mini-board win
    if (checkWin(miniBoard) === playerSymbol) {
        newState.board[move.boardRow][move.boardCol].winner = playerSymbol;
    } else if (checkScratch(miniBoard)) {
        newState.board[move.boardRow][move.boardCol].isScratch = true;
    }

    // Update last played cell
    newState.lastPlayedCell = {
        boardRow: move.boardRow,
        boardCol: move.boardCol,
        cellRow: move.cellRow,
        cellCol: move.cellCol
    };

    // Switch turn
    newState.turn = state.turn === Turns.Player1 ? Turns.Player2 : Turns.Player1;

    return newState;
}

function applyMove(state, move) {
    const playerSymbol = state.turn === Turns.Player1 ? 'X' : 'O';

    // Update mini-board
    const miniBoard = state.board[move.boardRow][move.boardCol].miniGrid;
    miniBoard[move.cellRow][move.cellCol] = playerSymbol;

    // Check for mini-board win
    if (checkWin(miniBoard) === playerSymbol) {
        state.board[move.boardRow][move.boardCol].winner = playerSymbol;
    } else if (checkScratch(miniBoard)) {
        state.board[move.boardRow][move.boardCol].isScratch = true;
    }

    // Update last played cell
    state.lastPlayedCell = {
        boardRow: move.boardRow,
        boardCol: move.boardCol,
        cellRow: move.cellRow,
        cellCol: move.cellCol
    };

    // Switch turn
    state.turn = state.turn === Turns.Player1 ? Turns.Player2 : Turns.Player1;

    return state;
}
