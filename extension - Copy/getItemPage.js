//getItemPage.js

//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y
//Get exchange rate from api
function getRate(from,to){
  var url = "https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y"
  var x = new XMLHttpRequest();
  x.overrideMimeType('text/json');
  console.log("getRate from: " + url);
  x.open('GET', url);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      processResponse(x.responseText, cat);
      //alert(x.responseText);
    }
  };
  x.send();
}

function processResponse(response, cat){
  //add code to handle response here
  //parse response HTML and find the first search result
  console.log("process xhr response");
  console.log(response);

  //text = extractTextCell(response);
  //console.log(text);

  //xmlDoc = jQuery.parseXML(text);
  //target = getFirstLink(xmlDoc);
  //sendMessage("searchresult", target, cat);
}

getRate("EUR","USD")

//Send message with URL from content.js, catch in message listener and send xhr
//Parse response then send new url back to content.js with message
function getPageContent(url, cat){
  var x = new XMLHttpRequest();
  x.overrideMimeType('text/xml');
  console.log("getPageContent for: " + url);
  x.open('GET', url);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      processResponse(x.responseText, cat);
      //alert(x.responseText);
    }
  };
  x.send();
}



function processResponse(response, cat){
  //add code to handle response here
  //parse response HTML and find the first search result
  console.log("process xhr response");
  //console.log(response);

  text = extractTextCell(response);
  console.log(text);

  xmlDoc = jQuery.parseXML(text);
  target = getFirstLink(xmlDoc);
  sendMessage("searchresult", target, cat);
}

function getFirstLink(xmlDoc){

  if(xmlDoc == null){
    return null;
  }

  //searchresults = xmlDoc.getElementsByClassName("textCell");
  links = xmlDoc.getElementsByTagName("a");
  if(links.length > 0 && links[0].hasAttribute("href")){
    target = links[0].getAttribute("href");
    console.log(target);
    return target;
  }
  return null;
}

function extractTextCell(response){
  //Extract the relevant div then convert into xmlDoc
  start = response.search("<div class=\"textCell\">");
  eod = response.length-1;
  substr = response.substring(start,eod);
  end = substr.search("</a>");
  text = substr.substring(0,end+11);

  return text;
}

function sendMessage(msg, url, cat){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": msg, "url": url, "cat": cat});
  });
}
