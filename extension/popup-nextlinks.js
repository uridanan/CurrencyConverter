//popup.js
main();

function main(){
  // viewcarturl = "http://il.nextdirect.com/en/ViewData/ViewCart-View";//getShoppingCartViewUrl();
  // chrome.runtime.sendMessage({"message": "oniconclick","url":viewcarturl});
  chrome.runtime.sendMessage({"message": "oniconclick"});
  //window.onload = createPopup();
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "onshoppingbagready" ) {
      createPopup();
    }
  });


function createPopup(){
  setVersionInfo();
  var background = chrome.extension.getBackgroundPage();
  addShoppingBag(background.shoppingbagitems); //read it from background.js
}

function getFullExtName(){
    var manifest = chrome.runtime.getManifest();
    console.log(manifest.name);
    console.log(manifest.version);
    var fullExtName = manifest.name + " v" + manifest.version;
    return fullExtName;
}

function setVersionInfo(){
  var versioninfo = document.getElementById("version");
  if(versioninfo != null){
    console.log(version.innerText);
    version.innerText = getFullExtName();
  }
  else
    console.log("Version info is null?");
}

function addShoppingBag(payload){
  var shoppingbag = document.getElementById("shoppingbag");
  if(shoppingbag != null){
    console.log(shoppingbag.innerHTML);
    shoppingbag.innerHTML = payload;
  }
  console.log("Shopping bag is null?");
}

//Use a page action instead of a browser action
//Use chrome.pageAction.setPopup(object details)
//Extract the table from the shopping bag via xhr or content.js
// then add a header marquee + app name + version
