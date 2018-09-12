//popup.js
//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y

// TODO:
//Refactor using classes
//Combine in one file
//Improve layout
//Search currencies
var selectedCurrencies = new persistentList("selectedCurrencies");

function main(){

}

function getKey(from,to){
  return from+"_"+to;
}

//A class to store the selected currencies
class persistentList {
  constructor(name) {
    this.entries = {};
    this.name = name;
  }

  function add(entry){
    this.entries[entry] = entry;
    this.save();
  }

  function remove(entry){
    delete this.entries[entry];
    this.save();
  }

  function get(){
    return this.entries;
  }

  function save(){
    json = JSON.stringify(this.entries);
    localStorage.setItem(this.name, json);
  }

  function load(){
    //Load values from local storage
    json = localStorage.getItem(this.name);
    if (json == undefined){
      return;
    }
    var input = JSON.parse(json);
    if (input == undefined){
      return;
    }
    this.entries = input;
  }

}

class exchangeRates {
  constructor() {
    this.mExchangeRates = {};
  }

  function addExchangeRate(from,to,rate){
    if(rate == 0 || rate == undefined){
      return;
    }
    fromto = getKey(from,to);
    tofrom = getKey(to,from);
    this.mExchangeRates[fromto] = rate;
    this.mExchangeRates[tofrom] = 1/rate;

    if(to.localeCompare(activeCurrency) == 0){
      setExRateValue(from);
    }
  }

  function getExchangeRate(from,to){
    return this.mExchangeRates[from+"_"+to];
  }
}


class exchangeRatesTable {
  constructor() {

  }

  function addCurrency(symbol){
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

  function removeCurrency(currency){

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
}


//============================================================================




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




//============================================================================
//============================================================================

var exRates = {};
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



function getCurrencyDisplayName(id){
  var symbol = "(" + id + ")";
  if (currenciesJSON[id].currencySymbol != undefined){
    symbol = "(" + currenciesJSON[id].currencySymbol + ")";
  }
  var name = currenciesJSON[id].currencyName + symbol;
  return name;
}




function addSelectedCurrency(currency){
  for (var c in selectedCurrencies){
    getRate(currency,c);
  }
  selectedCurrencies[currency] = currency;
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
