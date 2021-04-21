
const path = require('path');
const url = require('url');

const customTitlebar = require('custom-electron-titlebar');
const { ipcRenderer, Menu } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  
  let titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#2f3241'),
    icon: url.format(path.join(__dirname, '/icon.png')),
    shadow: true,
  });
 
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  ipcRenderer.on("updateTitle2",function(event,arg){
    titlebar.updateTitle(arg)
  })

})
