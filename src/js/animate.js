let buttons = document.querySelectorAll("#menuContainer button")
buttons.forEach(button => {
    button.addEventListener("click", (event) => {
        let mask = document.querySelector("#mask")
        mask.classList.add("animate")
        setTimeout(() => {
            mask.classList.remove("animate")
        }, 2000)
        
    })
});