document.querySelectorAll("#menuContainer button").forEach(button => {
    button.addEventListener("click", (event) => {
        setTimeout(switchToGame, 1000)
        
    })
});
let GameModes = {
    PlayerVsPlayer: 1,
    PlayerVsComputer: 2,
}
let Turns = {
    Player1: 1,
    Player2: 2,
}
let turn = Turns.Player1;
let gameMode;

function setGameMode(mode){
    gameMode = mode;
}


setGameMode(GameModes.PlayerVsPlayer)
switchToGame()

document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", (event) => {
        if (!cell.parentElement.parentElement.classList.contains("active") || cell.classList.contains("marked")) {return};
        clickedCell(parseInt(cell.id.split('-')[0].slice(4)), parseInt(cell.id.split('-')[1]));
    })
})

function switchToGame(){
    document.querySelector("#menuContainer").style.display = "none";

    setAllBoredsActive()
}

function clickedCell(board, cell){
    console.log(`Clicked on board ${board} and cell ${cell}`);
    removeMarkedLastHighLight();
    removeActive();
    if(turn == Turns.Player1){
        document.querySelector(`#cell${board}-${cell}`).classList.add("marked", "markX");
        document.querySelector(`#cell${board}-${cell}`).innerHTML = "X";
        turn = Turns.Player2;
    } else if(turn == Turns.Player2){
        document.querySelector(`#cell${board}-${cell}`).classList.add("marked", "markO");
        document.querySelector(`#cell${board}-${cell}`).innerHTML = "O";
        turn = Turns.Player1;
    }
    let boardData = [];
    for(let i = 0; i < 3; i++){
        boardData.push([]);
        for(let j = 0; j < 3; j++){
            boardData[i].push(document.querySelector(`#cell${board}-${j + 1 + i * 3}`).innerHTML);
        }
    }
    let winner = checkWin(boardData)
    if(winner != ""){
        document.querySelector(`#board${board}`).classList.remove("active");
        document.querySelector(`#board${board}`).classList.add("won");
        document.querySelector(`#board${board} .windisplay`).innerHTML = winner;

    }
    setBoardActive(cell);
}

function removeMarkedLastHighLight(){
    document.querySelectorAll(".marked").forEach(cell => {
        cell.classList.remove("markX");
        cell.classList.remove("markO");
    })
}
function removeActive(){
    document.querySelectorAll(".board").forEach(board => {
        board.classList.remove("active");
    })
}
function setAllBoredsActive(){
    document.querySelectorAll(".board").forEach(board => {
        board.classList.add("active");
    })
}
function setBoardActive(board){
    document.querySelector(`#board${board}`).classList.add("active");
}
