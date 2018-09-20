// content.js
var myShoppingBag = {
  bag: {},
  add: function(cat, element){
    if(this.bag[cat] == null){
      this.bag[cat] = [element];
    }
    else{
      this.bag[cat].push(element);
    }
  },
  get: function(cat){
    return this.bag[cat];
  }
};

addLinksToShoppingCart();


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "searchresult" ) {
        url = request.url;
        cat = request.cat;
        console.log("Search Result received for " + cat + ": " + url);
        elements = myShoppingBag.get(cat);
        for (i in elements){
          html = elements[i].innerHTML;
          elements[i].innerHTML = addLink(html,url);
        }
    }
  }
);


///////////////////////////////////////////////////////////////////////////////
//Add Links to shopping cart
///////////////////////////////////////////////////////////////////////////////

function addLinksToShoppingCart(){
  var elements = getElementsInShoppingCart();
  for (var i in elements) {
    if (elements.hasOwnProperty(i)) {
      e = elements[i];
      processElement(e);
      console.log(e.innerHTML);
    }
  }
}

function getElementsInShoppingCart(){
  return document.getElementsByClassName("basketDesc");
}

function processElement(e){
  html = e.innerHTML;
  text = e.innerText;
  console.log(text);
  cat = extractCatalogNumber(text);
  console.log(cat);
  myShoppingBag.add(cat,e);
  url = getSearchURL(cat);
  getPageContent(url, cat);
}

function getPageContent(url, cat){
  chrome.runtime.sendMessage({"message": "getpagecontent", "url": url, "cat": cat});
}

function sendMessage(msg, url){
  chrome.runtime.sendMessage({"message": msg, "url": url});
}

//Called in the callback from getPageContent
function addLink(html,url){
  newHTML = "<a target=\"_blank\" href="+url+">"+html+"</a>";
  return newHTML;
}
