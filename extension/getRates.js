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
  addExRate(from,to,rate);
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

function populateRatesTable() {
  var currencies = document.getElementById("currenciesTable");
  var selectedCurrencies = currencies.querySelectorAll('[selected="1"]');
}

function addCurrencyToRatesTable(symbol){
  var rates = document.getElementById("ratesTable");
  var row = rates.insertRow(0);
  var input = row.insertCell(0);
  var currency = row.insertCell(1);
  var sym = symbol;
  var name = getCurrencyDisplayName(sym);
  row.setAttribute("currency",sym);
  currency.innerHTML = sym+": "+name;
  input.innerHTML = '<input type="text" id="amount" value="" width="100%" onKeyUp="update()">';

  //Init value, just in case this happens after the getRate request returns
  setExRateValue(sym);
}

function update(){
  //console.log(event.key);
  var input = event.currentTarget;
  var value = input.value;
  console.log(value);
  var baseCurrency = input.parentNode.parentNode.getAttribute("currency");
  console.log(baseCurrency);

  //Update global variables
  activeCurrency = baseCurrency;
  baseAmount = value;

  //On update, set the value in all the other boxes
  for (c in selectedCurrencies){
    setExRateValue(c);
  }
}

function setExRateValue(newCurrency){
  if (newCurrency.localeCompare(activeCurrency) != 0){
    console.log(newCurrency);
    //Get rates
    var rate = exRates[activeCurrency+"_"+newCurrency];
    //Compute amount
    if (rate != undefined && baseAmount != undefined){
      var amount = baseAmount * rate;
      //Set value
      var row = getCurrencyRow(newCurrency);
      row.children[0].children[0].value = amount.toFixed(2);
    }
  }
}

function getCurrencyRow(symbol){
  var rates = document.getElementById("ratesTable");
  var row = rates.querySelector('[currency="'+symbol+'"]');
  return row;
}

function removeCurrencyFromRatesTable(symbol){
  var rates = document.getElementById("ratesTable");
  var row = rates.querySelector('[currency="'+symbol+'"]');
  rates.deleteRow(row.rowIndex);
}

function getCurrencyDisplayName(id){
  var symbol = "(" + id + ")";
  if (currenciesJSON[id].currencySymbol != undefined){
    symbol = "(" + currenciesJSON[id].currencySymbol + ")";
  }
  var name = currenciesJSON[id].currencyName + symbol;
  return name;
}

var exRates = {};
var selectedCurrencies = {};
var activeCurrency = undefined;
var baseAmount = 0;

//loadSelectedCurrencies();
//var r = getRate("EUR","USD")
//addExRate("EUR","USD",1.2)

// TODO:
//Refactor using classes
//Combine in one file
//Improve layout
//Sort currencies
//Search currencies

function addExRate(from,to,rate){
  if(rate == 0 || rate == undefined){
    return;
  }
  fromto = from+"_"+to;
  tofrom = to+"_"+from;
  exRates[fromto] = rate;
  exRates[tofrom] = 1/rate;

  if(to.localeCompare(activeCurrency) == 0){
    setExRateValue(from);
  }
}

function saveSelectedCurrencies(){
  json = JSON.stringify(selectedCurrencies);
  localStorage.setItem("selectedCurrencies", json);
}

function addSelectedCurrency(currency){
  for (var c in selectedCurrencies){
    getRate(currency,c);
  }
  selectedCurrencies[currency] = currency;
  saveSelectedCurrencies();
}

function removeFromSelected(currency){
  delete selectedCurrencies[currency];
  saveSelectedCurrencies();
}

function selectCurrency(currency){
  addCurrencyToRatesTable(currency);
  addSelectedCurrency(currency);
}

function removeCurrency(currency){
  removeCurrencyFromRatesTable(currency);
  removeFromSelected(currency);
}



function foo(){
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



//Class example
//class User {
//
//  constructor(name) {
//    this.name = name;
//  }
//
//  sayHi() {
//    alert(this.name);
//  }
//
//}
//
//let user = new User("John");
//user.sayHi();

//sendMessage({"message": "exRateAdded", "from": from, "to": to});
//function sendMessage(msg){
//  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//    var activeTab = tabs[0];
//    chrome.tabs.sendMessage(activeTab.id, msg);
//  });
//}


//chrome.runtime.onMessage.addListener(
//  function(request, sender, sendResponse) {
//    if( request.message == "exRateAdded" ){
//      console.log("Message received: exRateAdded");
//      var from = request.from;
//      var to = request.to;
//      var rate = request.rate;
//      setExRateValue(from);
//    }
//  }
//);
