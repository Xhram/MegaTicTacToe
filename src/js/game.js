

let Turns = {
    Player1: 1,
    Player2: 2,
}
let turn = Turns.Player1;



// switchToGame()

function addListeners(){

    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("click", (event) => {
            if (!cell.parentElement.parentElement.classList.contains("active") || cell.classList.contains("marked")) {return};
            clickedCell(parseInt(cell.id.split('-')[0].slice(4)), parseInt(cell.id.split('-')[1]));
        })
    })
}
addListeners();

function switchToGame(){
    document.querySelector("#menuContainer").classList.add("hide");
    document.querySelector("#gameContainer").classList.remove("hide");

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
        document.querySelector(`#board${board}`).classList.add("won", winner == "X" ? "markX" : "markO");
        document.querySelector(`#board${board} .windisplay`).innerHTML = winner;
        checkWholeGameWin()
    }
    if(document.querySelector(`#board${cell}`).classList.contains("won")){
        setAllBoredsActive();
    } else {
        setBoardActive(cell);
    }
    saveGame();

}
function checkWholeGameWin(){
    let boardData = [];
    for(let i = 0; i < 3; i++){
        boardData.push([]);
        for(let j = 0; j < 3; j++){
            boardData[i].push(document.querySelector(`#board${j + 1 + i * 3} .windisplay`).innerHTML);
        }
    }
    let winner = checkWin(boardData)
    if(winner != ""){
        document.querySelector("#gameContainer").classList.add("won");
        document.querySelector("#gameInfo .winner").innerHTML = winner;
        document.querySelector("#gameInfo .winner").classList.add(winner == "X" ? "markX" : "markO");
        setTimeout(()=>{
            document.querySelector("#gameInfo").classList.remove("hide");
            document.querySelector("#game").classList.add("hide");
        },2500)
        deleteGame();
    }
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
        if(board.classList.contains("won")){return}
        board.classList.add("active");
    })
}
function setBoardActive(board){
    document.querySelector(`#board${board}`).classList.add("active");
}

let initGame = document.querySelector("#gameContainer").innerHTML
function resetGame(){
    deleteGame();
    setTimeout(()=>{
        document.querySelector("#gameContainer").innerHTML = initGame;
        document.querySelector("#menuContainer").classList.remove("hide");
        document.querySelector("#gameContainer").classList.add("hide");
        document.querySelector("#gameContainer").classList.remove("won");
        requestAnimationFrame(()=>{addListeners()});
    },1000);
    let mask = document.querySelector("#mask")
    mask.classList.add("animate")
    setTimeout(() => {
        mask.classList.remove("animate")
    }, 2000)
}