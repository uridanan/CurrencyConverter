//common.js

//////////////////////////
//URL Manipulation
//////////////////////////
function getCurrentURL(){
  return window.location.href;
}

function getCurrentHostname(){
  return window.location.hostname;
}

function getCurrentPathName(){
  return window.location.pathname;
}

function getViewCartPathname(){
  return "ViewData/ViewCart-View";
}

function getSearchPathname(){
  return "search/SearchTerm-";
}

//This one works only on the viewcart so it's only relevant in content.js
function getBaseURLFromViewCart(){
  baseURL = getCurrentURL();
  baseURL = baseURL.substring(0,baseURL.length - getViewCartPathname().length);
  //console.log(baseURL);
  return baseURL;
}

function getBaseURLFrom(currenturl){
  start = 0;
  end = currenturl.search("nextdirect.com") + 18;
  baseURL = currenturl.substring(start,end);
  console.log(baseURL);
  return baseURL;
}

function getBaseURL(){
  currenturl = getCurrentURL();
  return getBaseURLFrom(currenturl);
}

function getSearchURL(catalogNumber){
  //TODO: retrieve the link from the search results and redirect
  //searchURL = "http://il.nextdirect.com/en/search/SearchTerm-";
  //url = searchURL + catalogNumber;
  searchURL = getBaseURL() + getSearchPathname() + catalogNumber;
  return searchURL;
}

function extractCatalogNumber(text){
  return text.substring(text.length - 11);
}

function extractDescription(text){
  return text.substring(0,text.length - 11);
}

// function getShoppingCartViewUrl(){
//   //return "http://il.nextdirect.com/en/ViewData/ViewCart-View";
//   return getBaseURL() + getViewCartPathname();
// }

function getShoppingCartViewUrl(currentURL){
  //return "http://il.nextdirect.com/en/ViewData/ViewCart-View";
  return getBaseURLFrom(currentURL) + getViewCartPathname();
}

//////////////////////////
//Messages & Chrome Actions
//////////////////////////
function openNewTab(url){
  chrome.runtime.sendMessage({"message": "open_new_tab", "url": url});
}
