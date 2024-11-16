function runAI(depth) {
    const gameState = gameStateToJSON(); // Get the current game state
    const bestMoves = findBestMoves(gameState, depth);

    if (bestMoves.length > 0) {
        const move = bestMoves[0]; // Select the first best move
        console.log('Best Moves:', bestMoves);
        console.log(`AI selects board (${move.boardRow}, ${move.boardCol}) and cell (${move.cellRow}, ${move.cellCol})`);

        // Calculate board and cell numbers based on their positions
        const boardNumber = move.boardRow * 3 + move.boardCol + 1;
        const cellNumber = move.cellRow * 3 + move.cellCol + 1;

        // Construct the cell ID as per your HTML structure
        const cellId = `cell${boardNumber}-${cellNumber}`;
        const cellElement = document.getElementById(cellId);

        if (cellElement) {
            // Simulate a click event on the cell
            cellElement.click();
        } else {
            console.error(`Cell element with ID ${cellId} not found.`);
        }
    } else {
        console.log("No possible moves found.");
    }
}

let aiRunning = false;
let aiStopRequested = false;

function endEarly() {
    aiStopRequested = true;
}

async function runAIUntilGameOver(depth) {
    aiRunning = true;
    aiStopRequested = false;
    let moveCount = 0; // Initialize move counter

    while (aiRunning && !aiStopRequested) {
        // Check if the game is over
        const gameOver = checkGameOver();
        if (gameOver) {
            console.log(`Game over. Total moves made: ${moveCount}.`);
            aiRunning = false;
            break;
        }

        // Run the AI move
        runAI(depth);
        moveCount++; // Increment move counter
        console.log(`Move number: ${moveCount}`); // Log move count

        // Wait for the player's move or a short delay
        await waitForPlayerMove();

        // Optional: Add a small delay to prevent overwhelming the event loop
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    aiRunning = false;
    aiStopRequested = false;
}

function checkGameOver() {
    // Implement a function to check if the game is over
    // Returns true if the game is over, false otherwise
    const gameState = gameStateToJSON();
    const winner = checkWholeGameWin_AI(gameState.board);
    return winner !== null;
}

function waitForPlayerMove() {
    return new Promise(resolve => {
        // Add an event listener or polling mechanism to detect the player's move
        // For simplicity, we'll use a timeout here
        setTimeout(() => {
            resolve();
        }, 500); // Adjust the delay as needed
    });
}