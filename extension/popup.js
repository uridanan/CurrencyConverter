//popup.js
//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y

// TODO:
//Refactor using classes
//Combine in one file
//Improve layout
//Search currencies
var selectedCurrencies = new persistentList("selectedCurrencies");
var ratesTable = new exchangeRatesTable("ratesTable");
var rates = new exchangeRates();
var currencies = new currenciesList(currenciesJSON);
var currenciesTable = new currenciesTable("currenciesTable");

function main(){
  selectedCurrencies.load();
  currenciesTable.init(3);


  populateCurrenciesTable(currenciesJSON,3);
  selectDefaultTab();
}

function getKey(from,to){
  return from+"_"+to;
}

function update(){
  ratesTable.update(event);
}

function toggleSelect(){
  currenciesTable.toggle(this);
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

  function add(from,to,rate){
    if(rate == 0 || rate == undefined){
      return;
    }
    fromto = getKey(from,to);
    tofrom = getKey(to,from);
    this.mExchangeRates[fromto] = rate;
    this.mExchangeRates[tofrom] = 1/rate;

    //Add exchange rates for all currency pairs but compute the value only for the active currency
    if(to.localeCompare(activeCurrency) == 0){
      ratesTable.computeValue(from); //setExRateValue(from);
    }
  }

  function get(from,to){
    return this.mExchangeRates[getKey(from,to)];
  }
}


class exchangeRatesTable {

  constructor(id) {
    this.id = id;
    this.activeCurrency = undefined;
    this.baseAmount = 0;
  }

  function getElement(){
    return document.getElementById(this.id);
  }

  function addCurrency(symbol){
    var row = this.getElement().insertRow(0);
    var input = row.insertCell(0);
    var currency = row.insertCell(1);
    var name = getCurrencyDisplayName(symbol);   //TODO: this is not part of the class
    row.setAttribute("currency",symbol);
    currency.innerHTML = symbol+": "+name;
    input.innerHTML = '<input type="text" id="amount" value="" width="100%" onKeyUp="update()">';

    //Init value, just in case this happens after the getRate request returns
    this.computeValue(symbol);
  }

  function removeCurrency(symbol){
    var row = this.getCurrencyRow(symbol);
    rates.deleteRow(row.rowIndex);
  }

  function update(e){
    //console.log(event.key);
    var input = e.currentTarget;
    var value = input.value;
    console.log(value);
    var baseCurrency = input.parentNode.parentNode.getAttribute("currency");
    console.log(baseCurrency);

    //Update global variables
    this.activeCurrency = baseCurrency;
    this.baseAmount = value;

    //On update, set the value in all the other boxes
    for (c in selectedCurrencies){
      this.computeValue(c);
    }
  }

  function getCurrencyRow(symbol){
    var row = this.getElement().querySelector('[currency="'+symbol+'"]');
    return row;
  }

  function setValue(symbol,value){
    var row = this.getCurrencyRow(symbol);
    row.children[0].children[0].value = value.toFixed(2);
  }

  function computeValue(selectedCurrency){
    if (selectedCurrency.localeCompare(activeCurrency) != 0){
      console.log(selectedCurrency);
      //Get rates
      var rate = rates.get(activeCurrency,selectedCurrency);
      //Compute amount
      if (rate != undefined && this.baseAmount != undefined){
        var amount = this.baseAmount * rate;
        //Set value
        this.setValue(selectCurrency,amount);
      }
    }
  }
}



//============================================================================
//============================================================================
//============================================================================


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

function getRateRequestURL(from,to){
  var currencyPair = getCurrencyPair(from,to);
  var url = "https://free.currencyconverterapi.com/api/v5/convert?q="+currencyPair+"&compact=y";
  return url;
}

//============================================================================

class currency{

}

class currenciesList{
  constructor(list){
    this.currencies = list;
  }

  function getCurrencyName(id){
    return this.currencies[id].currencyName;
  }

  function getCurrencyDisplayName(id){
    var symbol = "(" + id + ")";
    if (this.currencies[id].currencySymbol != undefined){
      symbol = "(" + this.currencies[id].currencySymbol + ")";
    }
    var name = currenciesJSON[id].currencyName + symbol;
    return name;
  }

  function getAll(){
    var keys = Object.keys(this.currencies);
    keys.sort();
    return keys;
  }

}

class currenciesTable{
  constructor(id){
    this.id = id;
  }

  function getElement(){
    return document.getElementById(this.id);
  }

  function init(rowSize){
    var table = this.getElement();
    var rowIndex = 0;
    var cellIndex = 0;
    var row = table.insertRow(rowIndex++); //init table with first row
    var keys = currencies.getAll();
    for (var i in keys)
    {
      //Option element is to create a dropdown
      //var option = document.createElement('option');
      //option.value = currency;
      //option.text = currenciesJSON[currency].name;
      //select_currency.appendChild(option);
      var currency = keys[i];
      var cSymbol = currency;
      var cName = currencies.getCurrencyName(currency);

      var cell = row.insertCell(cellIndex++);
      var button = new currencyButton(cSymbol);
      cell.appendChild(button.instance());

      if(cellIndex == rowSize){
        row = table.insertRow(rowIndex++);
        cellIndex = 0;
      }
  }
}


class currencyButton{
  constructor(symbol){
    var btn = document.createElement('button');
    btn.className = "currencyBox";
    btn.id = symbol;
    btn.value = symbol;
    btn.setAttribute('selected',0);
    btn.setAttribute('currency',symbol);
    btn.onclick = toggleSelect;
    btn.innerHTML = this.getCurrencySymbolHTML(symbol)+"<br>"+this.getCurrencyNameHTML(symbol);
    this.btn = btn;
  }

  function instance(){
    return this.btn;
  }

  function getCurrencyButtonHTML(symbol){
    html = "<button class='currencyBox' id='"+symbol+"' value='"+symbol+"' selected=0 onclick='toggleSelect()'>"+this.getCurrencySymbolHTML(symbol)+"<br>"+this.getCurrencyNameHTML(symbol)+"<button>";
    return html;
  }

  function getCurrencyNameHTML(symbol){
    return "<span class='currencyName'>"+currencies.getCurrencyDisplayName(symbol)+"</span>";
  }

  function getCurrencySymbolHTML(symbol){
    return "<span class='currencySymbol'>"+symbol+"</span>";
  }
}



function toggle(btn){
  var status = btn.getAttribute('selected');
  if(status == "0"){
    this.selectCurrencyBox(btn);
  } else {
    this.unSelectCurrencyBox(btn);
  }
}

function findCurrencyButton(currency){
  var table = this.getElement();
  btn = table.querySelectorAll('button[currency="'+currency+'"]');
  //btn = table.querySelectorAll('button');
  return btn[0];
}

function selectCurrencyButton(currency){
  var btn = this.findCurrencyButton(currency);
  this.selectCurrencyBox(btn);
}

function selectCurrencyBox(btn){
  if (btn != null && btn != undefined){
    btn.className = "selectedCurrencyBox";
    btn.setAttribute('selected',1);
    selectCurrency(btn.id);
  }
}

function unSelectCurrencyBox(btn){
  if (btn != null && btn != undefined){
    btn.className = "currencyBox";
    btn.setAttribute('selected',0);
    removeCurrency(btn.id);
  }
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



function loadSelectedCurrencies(){
  selectedCurrencies.load();
  var currencies = selectedCurrencies.get();
  if (currencies == undefined){
    return;
  }

  //Populate rates table
  for (c in currencies){
    selectCurrencyButton(c);
  }
}
