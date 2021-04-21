const {remote,ipcRenderer, app} = require('electron'),
dialog = remote.dialog
const fs = require("fs")
var FilePath
const path = require("path")
ipcRenderer.on("ping",function(event,arg){
    let options = {
        title: "Create MarkDown File",
        buttonLabel : "Create MarkDown File",
        filters :[
         {name: 'MarkDown', extensions: ["md"]}
        ]
        }
    filename = dialog.showSaveDialog(options).then(result => {
          filename = result.filePath;
          if (filename.substring(filename.lastIndexOf('.') + 1)!="md") {
            return;
          }
          fs.writeFile(filename, "", (err) => {
            if (err) {
              alert('Error occurred in file creation!');
              return
            }
            ipcRenderer.send("lastOpen",filename)
          })
        })
})
ipcRenderer.on("ping2",function(event,arg){
    let options = {
        title: "Open MarkDown File",
        buttonLabel : "Open",
        filters :[
         {name: 'MarkDown', extensions: ["md"]}
        ]
        }
        dialog.showOpenDialog(
            options
        ).then((fileNames)=>{
              if (fileNames.filePaths[0] == undefined) {
                console.log("No file selected");
              } else {
                console.log(fileNames.filePaths[0])
                ipcRenderer.send("lastOpen",fileNames.filePaths[0])
                fs.readFile(fileNames.filePaths[0],"utf-8",(err,data)=>{
                    if(err){
                        console.log(err)
                        return
                    }
          
                })
              }
        }).catch(err=>console.log('Handle Error',err))
})  
var data = ipcRenderer.sendSync('get-file-data')
if (data ===  null || data==="." || data ==="--squirrel-firstrun") {
    console.log("There is no file")
} else {
  if(data.substring(data.lastIndexOf('.') + 1)==="md"){
    ipcRenderer.send("lastOpen",data)
    fs.readFile(data,"utf-8",(err1,data2)=>{
      if(err1){
          console.log(err1)
          return
      }

  })
  }else{
    alert("Wrong File Type")
    ipcRenderer.send('quit')
  }
}


ipcRenderer.on("openThisFile",function(event,arg){
  window.FilePath = arg
  console.log(arg)
  if(arg != ""){
    console.log("Open This File")
    var div = document.getElementById("mainBody")
    div.style.visibility="visible"
    var div2 = document.getElementById("welcome")
    div2.style.display="none"
    readMain(arg)


    // ipcRenderer.send('refresh')
  }
})
ipcRenderer.on("fileMoved",function(){
  console.log("show welcome")
  ipcRenderer.send('delData')

})
ipcRenderer.on("togglePreview",function(event,arg){
  var x =document.getElementById("preview")
  if(arg==="true"){
    x.style.display = "block";
  }else{
    x.style.display = "none";
  }
})
ipcRenderer.on("showWelcome",function(event){
  console.log("Showing Welcome")
  var div2 = document.getElementById("welcome")
  div2.style.visibility='visible'
  var div = document.getElementById("mainBody")
  div.style.visibility="hidden"
  div.style.maxHeight="0"
})
function saveAndShowPreview(data){
  fs.writeFile(FilePath, data, (err) => {
    if (err) {
      alert('Error occurred in file writing!');
      return
    }
  })
}
ipcRenderer.on("saveAsPpt",function(){
  var myCode2 = editor.getSession().getValue();
  let options = {
    title: "Export MarkDown File To HTML Slides",
    buttonLabel : "Export",
    filters :[
    {name: 'HTML', extensions: ["html"]}
    ]
    }
    
filename = dialog.showSaveDialog(options).then(result => {
      filename = result.filePath;
      var title = path.basename(result.filePath,'.html')
      if (filename.substring(filename.lastIndexOf('.') + 1)!="html") {
        return;
      }
      fs.writeFile(filename, `
      <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="utf-8">
            <style>
              @import url(https://fonts.googleapis.com/css?family=Yanone+Kaffeesatz);
              @import url(https://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic);
              @import url(https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700,400italic);
              body { font-family: 'Droid Serif'; }
              h1, h2, h3 {
                font-family: 'Yanone Kaffeesatz';
                font-weight: normal;
              }
              .remark-code, .remark-inline-code { font-family: 'Ubuntu Mono'; }
            </style>
          </head>
          <body>
            <textarea id="source">
                ${myCode2}
            </textarea>
            <script src="https://remarkjs.com/downloads/remark-latest.min.js">
            </script>
            <script>
              var slideshow = remark.create();
            </script>
          </body>
        </html>
      `, (err) => {
        if (err) {
          alert('Error occurred in file creation!');
          return
        }
        
      })
    })
})