function hasGameSave(){
    return (window.localStorage.getItem('gameSave')!=undefined);
}
if(hasGameSave()){
    document.querySelector(`#menuContainer button:nth-child(3)`).removeAttribute('disabled');
}
function saveGame(){
    window.localStorage.setItem('gameSave', document.querySelector("#gameContainer").innerHTML)
    window.localStorage.setItem('gameSaveTurn', turn)
}
function loadGame(){
    document.querySelector("#gameContainer").innerHTML = window.localStorage.getItem('gameSave')
    turn = window.localStorage.getItem('gameSaveTurn')
    addListeners()
}
function deleteGame(){
    window.localStorage.removeItem('gameSave')
    window.localStorage.removeItem('gameSaveTurn')
    document.querySelector(`#menuContainer button:nth-child(3)`).setAttribute('disabled', 'disabled');
}

