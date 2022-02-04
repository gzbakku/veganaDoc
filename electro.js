const { dialog,app,BrowserWindow } = require('electron');
// const dialog = electron.dialog;
// const app = electron.app;
const browser = BrowserWindow;
const ipc = require('hadron-ipc');
const fs = require("fs");
// const screen = electron.screen;

// console.log({screen:screen});

let win;

function createWindow(){

  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  win = new browser({
    width: width,
    height: height,
    frame:true,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation:false
    }
  });
  win.loadFile('electric.html');
  win.setMenuBarVisibility(false)
  // win.webContents.openDevTools();
}

app.on('ready', createWindow);

ipc.respondTo('open',async () => {
  const getLocation = await dialog.showOpenDialog(win,{
    title:'open vegana document',
    buttonLabel:'open vegana document',
    filters:[
      {name:'v_doc',extensions:['json']}
    ]
  });
  if(getLocation.canceled){return false;}
  let path = getLocation.filePaths[0];
  let data = fs.readFile(path,'utf-8',(e,d)=>{
    if(e){return false;}
    let parse = toJson(d);
    if(parse){
      win.send("open",{
        body:parse,
        path:path
      });
    }
  });
});

function toJson(d){
  let get = false;
  try {
    let convert = JSON.parse(d);
    get = convert;
  }
  catch(e){
    console.log("!!! failed-parse-toJSON");
  }
  return get;
}

ipc.respondTo('test', (_,data) => {
  console.log(data);
  win.send("test",{test:true});
});

ipc.respondTo('reopen_window', (_,data) => {
  let old = win;
  createWindow();
  old.close();
});

ipc.respondTo('save', (_,data) => {
  let asText = JSON.stringify(data.body,null,2);
  fs.writeFile(data.path,asText,(e)=>{
    if(e){return false;}
  });
  fs.writeFile(data.path,asText,(e)=>{
    if(e){
      return win.send("save_error",{
        path:data.path
      });
    } else {
      win.send("saved",{
        path:data.path
      });
    }
  });
});

ipc.respondTo('saveAs',async (_,data) => {
  const fetcher = await dialog.showSaveDialog(win,{
    title:'save vegana document',
    defaultPath:'vDoc.json'
  });
  if(fetcher.canceled){return false;}
  let path = fetcher.filePath;
  if(!path.includes(".json")){path += ".json";}
  let asText = JSON.stringify(data.body,null,2);
  fs.writeFile(path,asText,(e)=>{
    if(e){
      return win.send("save_error",{
        path:path
      });
    } else {
      win.send("saved",{
        path:path
      });
    }
  });
});


