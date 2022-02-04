const { body } = require("vegana-engine/get");

//controllers
const log = false;
const type = 'page';

//ids
const pageId = "page-main";
const pageName = 'mainPage';

//init page
const init = () => {
  engine.make.init.page(pageId,"page");  //init page
  build();                               //start build
}

//build page
function build(){

  engine.sketch.fonts.add(
    "roboto",
    "roboto",
    "assets/fonts/Roboto/Roboto-Light.ttf",
    true
  ).then(()=>{
    // console.log("font loaded");
  })
  .catch(()=>{
    console.error("!!! font load failed");
  });

  if(engine.get.platform() === "electron"){

    window.electron = require("electron");

    electron.ipcRenderer.on('saved',(event,data)=>{
      engine.global.function.alert("success","document saved at : " + data.path);
      if(data.path){
        engine.data.reset("path",data.path,"local");
      }
    });

    electron.ipcRenderer.on('open',(event,data)=>{
      engine.data.reset("doc",data.body,"local");
      engine.data.reset("path",data.path,"local");
      engine.global.function.resetEditor();
    });

    electron.ipcRenderer.on('save_error',(event,data)=>{
      engine.global.function.alert("danger","failed to save document to file : " + data.path);
    });

  }

  const EditorJS = require("@editorjs/editorjs");

  window.EditorJS = EditorJS;

  let control_key = false;
  let alt_key = false;
  let shift_key = false;

  window.addEventListener("keydown",(e)=>{

    // e.preventDefault();

    if(e.key === "Control"){control_key = true;return;} else
    if(e.key === "Shift"){shift_key = true;return;} else
    if(e.key === "Alt"){alt_key = true;return;}

    let build = '';
    if(control_key){build += "Control";}
    if(alt_key){if(build.length>0){build+="_";}build += "Alt";}
    if(shift_key){if(build.length>0){build+="_";}build += "Shift";}
    if(build.length>0){build+="_";}
    build += e.key;

    if(build === "Control_s"){
      save(false);
    } else
    if(build === "Control_Shift_s"){
      save(true);
    }
    if(build === "Control_o"){
      open();
    }

  });

  window.addEventListener("keyup",(e)=>{
    if(e.key === "Control"){control_key = false;} else
    if(e.key === "Shift"){shift_key = false;} else
    if(e.key === "Alt"){alt_key = false;}
  });

  const main = engine.make.div({
    parent:pageId,
    class:"editor",
  });

  build_menu(main);

  build_editor(main);

}

function build_menu(parent){

  const menu_div = engine.make.div({
    parent:parent,
    class:"editor-menu",
  });

  let message_div;
  const messages = engine.make.div({
    parent:menu_div,
    class:"editor-menu-messages",
  });

  function message(txt){
    if(message_div){
      engine.view.remove(message_div);
      message_div = null;
    }
    if(!txt){return;}
    message_div = engine.make.div({
      parent:messages,
      class:"editor-menu-messages-message",
      text:txt
    });
  }

  const main = engine.make.div({
    parent:parent,
    class:"editor-menu-icons",
  });

  let tools = [
    {icon:'new_file',function:()=>{
      engine.data.delete("path","local");
      engine.data.delete("doc","local");
      engine.global.function.resetEditor();
    }},
    {icon:'open',function:()=>{open();}},
    {icon:'save',function:()=>{save();}},
    {icon:'save_new',function:()=>{save(true);}},
    {icon:'paragraph',function:()=>{add_block("paragraph",editor,{})}},
    {icon:'heading',function:()=>{add_block("header",editor,{
      text: 'Enter a header',
      level: 1
    })}},
    {icon:'quote',function:()=>{add_block("quote",editor,{})}},
    {icon:'table',function:()=>{add_block("table",editor,{})}},
    {icon:'image',function:()=>{add_block("image",editor,{})}},
    {icon:'list',function:()=>{add_block("list",editor,{})}},
    {icon:'code',function:()=>{add_block("code",editor,{})}},
  ];

  for(let tool of tools){

    const icon = engine.make.div({
      parent:main,
      class:"editor-menu-icons-icon",
      function:()=>{tool.function();},
      events:[
        {event:'pointerenter',function:()=>{
          message(tool.icon);
        }},
        {event:'pointerleave',function:()=>{
          message();
        }}
      ]
    });

    engine.make.image({
      parent:icon,
      class:"editor-menu-icons-icon-img",
      type:'local',
      location:`assets/images/${tool.icon}.png`
    });

  }

}

function add_block(type,editor,data){
  editor.blocks.insert(type,data);
}

let editor;
function build_editor(parent){

  const editor_div = engine.make.div({
    parent:parent,
    class:"editor-worker",
  });

  engine.add.function("resetEditor",()=>{
    engine.view.remove(editor_div);
    build_editor(parent);
  });

  const data = engine.data.get("doc","local");

  editor = new EditorJS({
    data:data,
    holder:editor_div,
    tools: {
      code:{
        class:require('@editorjs/code'),
        config:{
          placeholder:"code goes here"
        }
      },
      embed:require('@editorjs/embed'),
      quote:require('@editorjs/quote'),
      header:require('@editorjs/header'),
      header:require('@editorjs/header'),
      table:require('@editorjs/table'),
      delimiter:require('@editorjs/delimiter'),
      paragraph:{
        class:require('editorjs-paragraph-with-alignment'),
        inlineToolbar: true,
      },
      list:{
        class:require('@editorjs/nested-list'),
        inlineToolbar: true,
      },
      image: {
        class: require('editorjs-inline-image'),
        inlineToolbar: true,
        config: {
          embed: {
            display: true,
          },
          unsplash: {
            appName: 'your_app_name',
            clientId: 'your_client_id'
          }
        }
      }
    }
  });

}

async function save(save_new){

  const saved = await editor.save().then((d)=>{
    engine.data.reset("doc",d,"local");
    return d;
  }).catch((e) => {
    engine.global.function.alert("danger","failed to get data from editor");
    return false;
  });

  if(!saved){
    return;
  }

  if(engine.get.platform() === "electron"){
    let path = engine.data.get("path","local");
    if(typeof(path) === "string" && !save_new){
      electron.ipcRenderer.send('save',{
        path:path,
        body:saved
      });
    } else {
      electron.ipcRenderer.send('saveAs',{
        body:saved
      });
    }
  }

}

async function open(){

  electron.ipcRenderer.send('open');

}

//do not change current exports you are free to add your own though.
let pageControllers = {
  init:init,
  ref:pageId,
  type:type,
  name:pageName,
  contModules:{},
  contList:{}
};
module.exports = pageControllers;
window.pageModules[pageName] = pageControllers;
