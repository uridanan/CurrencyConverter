//getItemPage.js

//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y
//Get exchange rate from api
function getRate(from,to){
  var currencyPair = from+"_"+to;
  var url = "https://free.currencyconverterapi.com/api/v5/convert?q="+currencyPair+"&compact=y";
  var x = new XMLHttpRequest();
  x.overrideMimeType('text/json');
  console.log("getRate from: " + url);
  x.open('GET', url);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      processResponse(x.responseText,currencyPair);
      //alert(x.responseText);
    }
  };
  x.send();
}

function processResponse(response,currencyPair){
  //add code to handle response here
  //parse response HTML and find the first search result
  console.log("process xhr response");
  console.log(response);
  rate = extractRate(response,currencyPair);
  console.log(rate);

  //text = extractTextCell(response);
  //console.log(text);

  //xmlDoc = jQuery.parseXML(text);
  //target = getFirstLink(xmlDoc);
  //sendMessage("searchresult", target, cat);
}

getRate("EUR","USD")

function extractRate(response,currencyPair){
  rate = "";
  var myObj = JSON.parse(response);
  rate = myObj[currencyPair].val;
  return rate;
}

//{EUR_USD: {val: 1.161595}}


function sendMessage(msg, url, cat){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": msg, "url": url, "cat": cat});
  });
}
