

let Turns = {
    Player1: 1,
    Player2: 2,
}
let turn = Turns.Player1;
let dep = 9;
let isAutoPlay = true;


// switchToGame()

function addListeners(){

    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("click", (event) => {
            let full = isBoredFull(parseInt(cell.id.split('-')[0].slice(4)));
            if (!cell.parentElement.parentElement.classList.contains("active") || (cell.classList.contains("marked") && !full)) {return};
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
        // if(isAutoPlay){
        //     setTimeout(()=>{console.log("AI move"),runAI(dep)},100)
        // }

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
    let x = 0;
    let o = 0;
    for(let i = 0; i < 3; i++){
        boardData.push([]);
        for(let j = 0; j < 3; j++){
            boardData[i].push(document.querySelector(`#board${j + 1 + i * 3} .windisplay`).innerHTML);
            boardData[i][j] == "X" ? x++ : boardData[i][j] == "O" ? o++ : null;
        }
    }
    let winner = checkWin(boardData)
    if(x + o == 9){
        if(x>o){
            winner = "X"
        } else if(o>x){
            winner = "O"
        }
    }
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
function isBoredFull(board){
    let full = true;
    for(let i = 1; i <= 9; i++){
        if(document.querySelector(`#cell${board}-${i}`).innerHTML == ""){
            full = false;
        }
    }
    return full;
}