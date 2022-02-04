const builder = require("electron-builder");
const Platform = builder.Platform;


/*
-----------------------------------

checkout electron builder for build instructions and configurations

https://www.electron.build/

https://github.com/electron-userland/electron-builder

*/

build();

async function build(){

  await builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
      "appId":"app.vegana.veganaDoc",
      "productName":"veganaDoc",
      "copyright":"gzbakku",
      "icon":"./assets/images/ico.ico",
      "directories":{
        "output":"build/electron"
      },
      "win":{
        "target":"nsis",
        "icon":"./assets/images/logo.png",
      },
      "linux":{
        "target":"AppImage"
      }
    }
  })
  .then(()=>{
    return true;
  })
  .catch((e)=>{
    console.error(e);
    return false;
  });

}
