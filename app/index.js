
//import all the pages here which you want to be in the app and use engine.get.pageModule api to get the page
const { global } = require('vegana-engine');
const mainPage = require('./pages/mainPage/page');
const startPage = mainPage; //declare the first page module here

require("./ui/index");

engine.ui.getComp("commonUi","alertComp").init("page-router");

// console.log(editorjs);

/*
set the base url to the native vegana cdn,or if hosting on non native platform please
set the baseurl to where the files for the project are held.

like if index.html is available at "https://example.com/app1/index.html"
then base url is "https://example.com/app1"
*/
engine.router.set.baseHref("");


// load all the fonts here you can await on font addition if you want
engine.sketch.fonts.add("text","nova-round","assets/fonts/NovaRound-Regular.ttf");  //sample font

//------------------------------------------------------------------------------
//init the page, pass anything you want to the page here


//this function takes the url and routes through user defined logic that you will provide.
function route_logic(){

  //you will get page,cont,panel and params for you to route to.
  let natives = engine.params.native.get();

  if(engine.router.active.page == null){
    //when there is no page you have to init one then you will have to use router to go to a new page.
    //you can only init a page once and only here.
    startPage.init(/*pass conts and further data to the page*/);
  }

}

route_logic();

//sample route function that goes to any page lazy or otherwise
//you can use loading ui here so user knows the web app is active
/*

async function route(){

  let natives = engine.params.native.get();
  if(!natives.page || natives.page === "mainPage"){
    return startPage.init();
  }

  if(!engine.get.pageModule(natives.page)){
    let loadPage = await engine.loader.load.page(natives.page,true)
    .then(()=>{return true;})
    .catch(()=>{return false;});
    if(!loadPage){return startPage.init();}
  }

  let mod = engine.get.pageModule(natives.page);
  if(mod){
    mod.init(natives);
  }

}

*/
