//controllers
const log = false;                        //turn on to log engine.common.tell string inputs
const compRef = '-comp-alertComp';             //dont worry about this
const type = 'comp';                      //type of app

//ids
var parentId;
var compId;

const init = (pid,data) => {         //pid referes to the parentPageId, pass this var when you init thiscomp.

  if(pid == null || pid == undefined){
    return engine.common.error('no_parent_page_ref_found'); //common error logger
  }

  parentId = pid;               //set parent page ref
  compId = parentId + compRef;  //set comp id
  engine.make.init.comp(compId,parentId,'comp');
  build(data);                      //start build you can also start fetch here.

}

function build(data){

  let message;
  const main = engine.make.div({
    parent:compId,
    class:"ui-common-comp-alert",
  });

  function build_message(type,txt){
    if(message){engine.view.remove(message);message = null;}
    if(!txt){return;}
    let message_class = 'ui-common-comp-alert-message';
    if(type === "danger"){message_class += ' ui-common-comp-alert-message-danger';}
    if(type === "success"){message_class += ' ui-common-comp-alert-message-success';}
    message = engine.make.div({
      parent:main,
      class:message_class,
      text:txt,
    });
    setTimeout(()=>{
      build_message();
    },5000);
  }

  engine.add.function("alert",build_message);

  // engine.global.function.alert("success","this is a test message");

}

module.exports = {init:init,ref:compRef,type:type}
