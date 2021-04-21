const {ipcRenderer} = require('electron')


function sendThemeData(data){
    ipcRenderer.send("theme-check",data)
}

ipcRenderer.on('check-data' ,function(event,arg){
    console.log(arg)
    const btn =  document.getElementById("btn")
    btn.addEventListener('click',function(){
        ipcRenderer.send("theme-data",arg) 
    }) 
})