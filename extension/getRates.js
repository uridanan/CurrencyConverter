//getRates.js

//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y
//Get exchange rate from api
function getRate(from,to){
  var url = getRateRequestURL(from,to);
  var x = new XMLHttpRequest();
  x.overrideMimeType('text/json');
  console.log("getRate from: " + url);
  x.open('GET', url);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      processResponse(x.responseText,from,to);
      //alert(x.responseText);
    }
  };
  x.send();
}

function processResponse(response,from,to){
  //add code to handle response here
  //parse response HTML and find the first search result
  console.log("process xhr response");
  console.log(response);
  //{EUR_USD: {val: 1.161595}}
  rate = extractRate(response,from,to);
  console.log(rate);

  document.getElementById("demo").innerHTML = "Rate from EUR to USD: " + rate;
  //sendMessage("searchresult", target, cat);
}

function extractRate(response,from,to){
  var currencyPair = getCurrencyPair(from,to);
  var myObj = JSON.parse(response);
  var rate = myObj[currencyPair].val;
  return rate;
}

function getCurrencyPair(from,to){
  return from+"_"+to;
}

function getRateRequestURL(from,to){
  var currencyPair = getCurrencyPair(from,to);
  var url = "https://free.currencyconverterapi.com/api/v5/convert?q="+currencyPair+"&compact=y";
  return url;
}

getRate("EUR","USD")






function sendMessage(msg, url, cat){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": msg, "url": url, "cat": cat});
  });
}


function populateRatesTable() {
  var currencies = document.getElementById("currenciesTable");
  //document.querySelectorAll('[data-foo="value"]');
  var rates = document.getElementById("ratesTable");
  var rowIndex = 0;
  var cellIndex = 0;
  var row = table.insertRow(rowIndex++); //init table with first row
  for (var currency in jsonInput)
  {
    //Option element is to create a dropdown
    //var option = document.createElement('option');
    //option.value = currency;
    //option.text = currenciesJSON[currency].name;
    //select_currency.appendChild(option);

    var cSymbol = currency;
    var cName = jsonInput[currency].name;


    var cell = row.insertCell(cellIndex++);
    var button = createCurrencyButton(cSymbol,cName);
    cell.appendChild(button);

    if(cellIndex == rowSize){
      row = table.insertRow(rowIndex++);
      cellIndex = 0;
    }

    //var cell = row.insertCell(cellIndex++);
    //var button = createCurrencyButton(cSymbol,cName);
    //cell.appendChild(button);
    //cell.innerHTML = getCurrencyButtonHTML(cSymbol,cName);
  }
}
