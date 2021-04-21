const { app, BrowserWindow ,nativeTheme, ipcMain, dialog } = require('electron');
const path = require('path');
const storage = require('electron-json-storage');
const electron = require("electron")
const ipc = electron.ipcMain;
const Menu = electron.Menu
const fs = require('fs')

if (require('electron-squirrel-startup')) { 
  app.quit();
}
var funcSendCreate;
let template2
var funcSendOpen;
var funcSendPath
let funcSaveAsHTML
let funcSaveAsHTML_PPT
let funcSaveAsPDF
let splash

let funcSaveAs
let themeSelector
let mainWindow
let funcSendWelcome
const createWindow = () => {
  function sendReqCreate(){       
    mainWindow.webContents.send("ping",'open')    
  }
  function sendReqOpen(){       
    mainWindow.webContents.send("ping2",'open')      
  }
  function sendPath(path){
    console.log(path)
    if(fs.existsSync(path)){
    storage.set("openedFile",{"path":path},function(error){
      if (error) throw error;
      mainWindow.webContents.send("openThisFile",path)
      
    })
    console.log(path)}else{
      mainWindow.webContents.send("fileMoved")
     
     
    }
  }

  function welcome(){
    console.log("Entering Show Welcome")
    mainWindow.webContents.send("showWelcome")
    
    console.log("Sending")
  }
  function saveAs(){
    storage.has("openedFile",function(err,has){
      if(has){
        mainWindow.webContents.send("saveAs")
      }else{
        dialog.showErrorBox("Cant Use Now","You cant use this function until a file is opened or created")
      }
    })
    
  }
  function saveAsHTML(){
    storage.has("openedFile",function(err,has){
      if(has){
        mainWindow.webContents.send("saveAsHtml")
      }else{
        dialog.showErrorBox("Cant Use Now","You cant use this function until a file is opened or created")
      }
    })
    
  }
  function saveAsPDF(){
    storage.has("openedFile",function(err,has){
      if(has){
        mainWindow.webContents.send("saveAsPdf")
      }else{
        dialog.showErrorBox("Cant Use Now","You cant use this function until a file is opened or created")
      }
    })
   
  }
  function saveAsPPT(){
    storage.has("openedFile",function(err,has){
      if(has){
        mainWindow.webContents.send("saveAsPpt")
      }else{
        dialog.showErrorBox("Cant Use Now","You cant use this function until a file is opened or created")
      }
    })
    
  }

  funcSaveAsHTML_PPT = saveAsPPT
  funcSaveAsPDF = saveAsPDF
  funcSaveAsHTML = saveAsHTML
  funcSaveAs = saveAs
  funcSendWelcome = welcome
  funcSendPath = sendPath
  funcSendCreate = sendReqCreate;
  funcSendOpen=sendReqOpen;
  mainWindow = new BrowserWindow({
    width: 1920,
    titleBarStyle: "hidden",
    minHeight:500,
    minWidth:900,
    height: 1080,
    show: false,
    frame:false,
    
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration:true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      devTools: false,
      
    }
  });
  splash = new BrowserWindow({width: 300, height: 300, minHeight:300,minWidth:300,maxHeight:300,maxWidth:300,transparent: false, frame: false, alwaysOnTop: true,closable:true,movable:false,resizable:false,webPreferences:{
    devTools: false
  }});
  splash.loadFile(path.join(__dirname, 'splash.html'))
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  ipcMain.on("updateTitle",function(){
    var title = mainWindow.getTitle()
    console.log(title)
    mainWindow.setTitle(title)
    mainWindow.webContents.send("updateTitle2",title)
  })


  themeSelector = new BrowserWindow({width: 500, height: 500, minHeight:500,minWidth:500,maxHeight:500,maxWidth:500,transparent: false, frame: false, alwaysOnTop: true,closable:true,movable:false,resizable:false,show:false,webPreferences:{
    nodeIntegration:true,
    contextIsolation: false,
    devTools: false
  }});
  storage.has('themes', function(error, hasKey) {
    if (hasKey) {

      storage.get('themes',function(error, data) {
        themeSelector.destroy()
        nativeTheme.themeSource = data.type
      });
    }
    else{


      themeSelector.on('close', function(e){
        e.preventDefault();
        var choice = require('electron').dialog.showMessageBox(themeSelector,
        {
           type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Are you sure you want to quit?',
          message: 'If you quit setup now then you need to complete setup again when you start application!'
        });
     choice.then(function(res){
        
       if(res.response== 0){
        
        storage.has("themes" ,function(error,check){
          if(check){
            storage.remove('themes', function(error) {
              if (error) throw error;
              
            });
            
          }
          else{
            app.exit(0)
          }
        })
       }
        // 1 for No
       if(res.response== 1){
        
       }
     })
   });
      ipc.on("theme-check",(function(events,arg){
        nativeTheme.themeSource = arg
        events.sender.send("check-data",arg)
        console.log(arg)
      }))
      ipc.once("theme-data",(function(event,arg){
        console.log(arg)
        storage.set("themes",{"type":arg},function(error){
          if (error) throw error;
          storage.set("preview",{"show":"true"},function(err){
            app.exit(0)
            app.relaunch()
          })
        })
      }))
      themeSelector.loadFile(path.join(__dirname, 'theme.html'))
      themeSelector.show()
      splash.destroy()
      mainWindow.destroy()
      
}
  });
  
  mainWindow.once('ready-to-show', () => {
    themeSelector.destroy()
    setTimeout(() => {
     
      splash.destroy();
      mainWindow.show();
      
      function sendStartUpData(){
        storage.has("openedFile",function(err,has){
          if(has){
            storage.get("openedFile",function(error, data) {
              fs.exists(data.path, function( exists ) {        
                if(exists){
                  mainWindow.webContents.send("openThisFile",data.path)
                  console.log(data.path)
                  console.log('TEST')
                }       
                else{
                  mainWindow.webContents.send("fileMoved")
                  console.log("No file found")
                 
                  
                }
            });
            });
          }
          else{
            console.log("show welcome screen")
            funcSendWelcome()
          }
        })
        
      }
      sendStartUpData()
     }, 5000);

  })
};

app.on('ready', function startUp(){

  createWindow()
  storage.get("themes",function(error,checkData){
    template2 = [
      {
          label:"File",
          submenu:[
            {
              label:"Create MD File",
              accelerator:"Control+N",
              click:function(){
                funcSendCreate()
              }
            },
            
            {
              label:"Open",
              accelerator:"Control+O",
              click:function(){
                funcSendOpen()
              }
            },
            {
              label:"Save As",
              // enabled:false,
              accelerator:"Control+S",
              id: 'saveBtn',
              click:function(){
                funcSaveAs()
              }
            },
            {
              type:"separator"
            },
            {
              label:"Exit",
              click:function(){
                app.exit(0)
              }
            },
          ]
        },
        {
          label:"Features",
          submenu:[
            {
              label:"Toggle Preview",
              // enabled:false,
              accelerator:"Shift+P",
              id: 'previewBtn',
              click:function(){
                storage.has("openedFile",function(err,has){
                  if(has){
                    storage.get("preview",function(err,data2){
                      if(data2.show==="true"){
                        storage.set("preview",{"show":"false"},function(error){
                          if (error) throw error;
                          mainWindow.webContents.send("togglePreview","false")
                        })
                      }
                      else{
                        storage.set("preview",{"show":"true"},function(error){
                          if (error) throw error;
                          mainWindow.webContents.send("togglePreview","true")
                        })
                      }
                    })
                  }else{
                    dialog.showErrorBox("Cant Use Now","You cant use this function until a file is opened or created")
                  }
                })
              }
            },
            {role: 'togglefullscreen'}
          ]
        },{
          label:"Themes",
          submenu:[
            {
              label:"Dark",
              checked:checkData.type==="dark"?true:false,
              type: 'radio',
              
              click:function(){
                storage.set("themes",{"type":"dark"},function(error){
                  if (error) throw error;
                  nativeTheme.themeSource = "dark"
                })
              }
            },{
              label:"Light",
              checked:checkData.type==="light"?true:false,
              type: 'radio',
              click:function(){
                storage.set("themes",{"type":"light"},function(error){
                  if (error) throw error;
                  nativeTheme.themeSource = "light"
                  
                })
              }
            },{
              label:"System Theme",
              type: 'radio',
              checked:checkData.type==="system"?true:false,
              click:function(){
                storage.set("themes",{"type":"system"},function(error){
                  if (error) throw error;
                  nativeTheme.themeSource = "system"
                  
                })
              }
            }
          ]
        },{
          id: 'checkFile',
          label:"Export",
          // enabled:false,
          
          submenu:[
            {
              label:"Export to Html",
              accelerator:"Control+H",
              click:function(){
                funcSaveAsHTML()
              }
            },{
              label:"Export to Pdf",
              accelerator:"Control+P",
              click:function(){
                funcSaveAsPDF()
              }
            },{
              label:"Export to Html Slide",
              accelerator:"Shift+S",
              click:function(){
                funcSaveAsHTML_PPT()
              }
            }
          ]
        },{
          label:"Help",
          click:function(){
            let shell = require('electron').shell
            shell.openExternal(path.join(__dirname,"help.html"))
          }
        }
  ]
    var menu = Menu.buildFromTemplate(template2)
    Menu.setApplicationMenu(menu)
    })

  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();

  }
});
ipcMain.on('get-file-data', function(event) {
  var data = null
  if (process.platform == 'win32' && process.argv.length >= 2) {
    var openFilePath = process.argv[1]
    data = openFilePath
  }
  event.returnValue = data
})
ipcMain.on("quit",function(){
  app.exit(0)
})
ipcMain.on("lastOpen",function(event,arg){
  funcSendPath(arg)
})
ipcMain.on("delData",function(event){
  storage.has("openedFile",function(err,has){
    if(has){
      storage.remove("openedFile",function(err){
        console.log(err)
        console.log("show welcome screen")
        funcSendWelcome()
        

      })
    }else{
      console.log("show welcome screen")
      funcSendWelcome()
    }

  })

})
ipcMain.once("relaunch",function(event){
  app.exit(0)
  app.relaunch()
})
