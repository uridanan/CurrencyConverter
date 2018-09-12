//getRates.js
//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y

// TODO:
//Refactor using classes
//Combine in one file
//Improve layout
//Search currencies

var exRates = {};
var selectedCurrencies = {};
var activeCurrency = undefined;
var baseAmount = 0;


function main(){
  populateCurrenciesTable(currenciesJSON,3);
  loadSelectedCurrencies();
  selectDefaultTab();
}

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


//----------------------------- Tabs =============================
function showTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function selectDefaultTab(){
  document.getElementById("defaultTab").click();
}

//-----------------------------Refactor into classes=============================



class exchangeRatesTable {
  constructor(name) {
    this.name = name;
  }

  sayHi() {
    alert(this.name);
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
