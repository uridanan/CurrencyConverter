//popup.js
//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y

//============================================================================
//============================================================================
// TODO:
//Improve layout
//Search currencies

//Improve tab style
//display active tab
//Select default tab
//Make sure tab bar is always on top
//Finish adding listeners
//Reduce number of calls on REST API to prevent being blocked

//============================================================================
//===============A class to store the selected currencies=====================
class persistentList {
  constructor(name) {
    this.entries = {};
    this.name = name;
  }

  add(entry){
    this.entries[entry] = entry;
    this.save();
  }

  remove(entry){
    delete this.entries[entry];
    this.save();
  }

  get(){
    return this.entries;
  }

  save(){
    var json = JSON.stringify(this.entries);
    localStorage.setItem(this.name, json);
  }

  load(){
    //Load values from local storage
    var json = localStorage.getItem(this.name);
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

//============================================================================
//=================A class to compute and store exchaange rates===============
class exchangeRates {
  constructor() {
    this.mExchangeRates = {};
  }

  add(from,to,rate){
    if(rate == 0 || rate == undefined){
      return;
    }
    var fromto = getKey(from,to);
    var tofrom = getKey(to,from);
    this.mExchangeRates[fromto] = rate;
    this.mExchangeRates[tofrom] = 1/rate;

    //Add exchange rates for all currency pairs but compute the value only for the active currency
    ratesTable.computeValueForActiveCurrency(to,from);
  }

  get(from,to){
    return this.mExchangeRates[getKey(from,to)];
  }
}

//============================================================================
//==================Implement and manage the exchange rates table=============
class exchangeRatesTable {

  constructor(id) {
    this.id = id;
    this.activeCurrency = undefined;
    this.baseAmount = 0;
  }

  isActiveCurrency(currency){
    return (currency.localeCompare(this.activeCurrency) == 0);
  }

  getElement(){
    return document.getElementById(this.id);
  }

  addCurrency(symbol){
    var row = this.getElement().insertRow(0);
    var input = row.insertCell(0);
    var currency = row.insertCell(1);
    var name = currencies.getCurrencyDisplayName(symbol);   //TODO: this is not part of the class
    row.setAttribute("currency",symbol);
    currency.innerHTML = symbol+": "+name;
    input.innerHTML = '<input type="text" class="amount" value="" width="100%">';
    //input.innerHTML = '<input type="text" class="amount" value="" width="100%" onKeyUp="update()">';

    //Init value, just in case this happens after the getRate request returns
    this.computeValue(symbol);
  }

  removeCurrency(symbol){
    var rates = this.getElement();
    var row = this.getCurrencyRow(symbol);
    rates.deleteRow(row.rowIndex);
  }

  update(e){
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
    for (var c in selectedCurrencies.get()){
      this.computeValue(c);
    }
  }

  getCurrencyRow(symbol){
    var row = this.getElement().querySelector('[currency="'+symbol+'"]');
    return row;
  }

  setValue(symbol,value){
    var row = this.getCurrencyRow(symbol);
    row.children[0].children[0].value = value.toFixed(2);
  }

  computeValueForActiveCurrency(baseCurrency, targetCurrency){
    //Add exchange rates for all currency pairs but compute the value only for the active currency
    if(this.isActiveCurrency(baseCurrency)){
      this.computeValue(targetCurrency); //setExRateValue(from);
    }
  }

  computeValue(targetCurrency){
    if (targetCurrency.localeCompare(this.activeCurrency) != 0){
      console.log(targetCurrency);
      //Get rates
      var rate = rates.get(this.activeCurrency,targetCurrency);
      //Compute amount
      if (rate != undefined && this.baseAmount != undefined){
        var amount = this.baseAmount * rate;
        //Set value
        this.setValue(targetCurrency,amount);
      }
    }
  }
}




//============================================================================
//============================================================================
class currenciesList{
  constructor(list){
    this.currencies = list;
  }

  getCurrencyName(id){
    return this.currencies[id].currencyName;
  }

  getCurrencyDisplayName(id){
    var symbol = "(" + id + ")";
    if (this.currencies[id].currencySymbol != undefined){
      symbol = "(" + this.currencies[id].currencySymbol + ")";
    }
    var name = currenciesJSON[id].currencyName + symbol;
    return name;
  }

  getAll(){
    var keys = Object.keys(this.currencies);
    keys.sort();
    return keys;
  }

}


//============================================================================
//============================================================================
class currenciesTable{
  constructor(id){
    this.id = id;
  }

  getElement(){
    return document.getElementById(this.id);
  }

  init(rowSize){
    this.generateTable(rowSize);
    this.loadSelectedCurrencies();
  }

  generateTable(rowSize){
    var table = this.getElement();
    var rowIndex = 0;
    var cellIndex = 0;
    var row = table.insertRow(rowIndex++); //init table with first row
    var keys = currencies.getAll();
    for (var i in keys) {
      //Option element is to create a dropdown
      //var option = document.createElement('option');
      //option.value = currency;
      //option.text = currenciesJSON[currency].name;
      //select_currency.appendChild(option);
      var currency = keys[i];
      var cSymbol = currency;
      var cName = currencies.getCurrencyName(currency);

      var cell = row.insertCell(cellIndex++);
      var button = new currencyButton("fromSymbol",cSymbol);
      cell.appendChild(button.instance());

      if(cellIndex == rowSize){
        row = table.insertRow(rowIndex++);
        cellIndex = 0;
      }
    }
  }

  loadSelectedCurrencies(){
    selectedCurrencies.load();
    var currencies = selectedCurrencies.get();
    if (currencies == undefined){
      return;
    }

    //Populate rates table
    for (var c in currencies){
      this.selectCurrencyButton(c);
    }
  }

  findCurrencyButton(currency){
    var table = this.getElement();
    var e = table.querySelectorAll('button[currency="'+currency+'"]');
    //btn = table.querySelectorAll('button');
    var btn = e[0];
    var instance = new currencyButton("fromButton", btn);
    return instance;
  }

  selectCurrencyButton(currency){
    var btn = this.findCurrencyButton(currency);
    btn.select();
  }

}


class currencyButton{
  constructor(type, param){
    if (type == "fromSymbol"){
      var btn = document.createElement('button');
      btn.className = "currencyBox";
      btn.id = param;
      btn.value = param;
      btn.setAttribute('selected',0);
      btn.setAttribute('currency',param);
      btn.onclick = toggleSelect;
      btn.innerHTML = this.getCurrencySymbolHTML(param)+"<br>"+this.getCurrencyNameHTML(param);
      this.btn = btn;
    }
    else {
      this.btn = param;
    }
  }

  instance(){
    return this.btn;
  }

  getCurrencyButtonHTML(symbol){
    html = "<button class='currencyBox' id='"+symbol+"' value='"+symbol+"' selected=0 onclick='toggleSelect()'>"+this.getCurrencySymbolHTML(symbol)+"<br>"+this.getCurrencyNameHTML(symbol)+"<button>";
    return html;
  }

  getCurrencyNameHTML(symbol){
    return "<span class='currencyName'>"+currencies.getCurrencyDisplayName(symbol)+"</span>";
  }

  getCurrencySymbolHTML(symbol){
    return "<span class='currencySymbol'>"+symbol+"</span>";
  }

  toggle(){
    var status = this.btn.getAttribute('selected');
    if(status == "0"){
      this.select(this.btn);
    } else {
      this.unSelect(this.btn);
    }
  }

  select(){
    if (this.btn != null && this.btn != undefined){
      this.btn.className = "selectedCurrencyBox";
      this.btn.setAttribute('selected',1);
      selectCurrency(this.btn.id);
    }
  }

  unSelect(){
    if (this.btn != null && this.btn != undefined){
      this.btn.className = "currencyBox";
      this.btn.setAttribute('selected',0);
      unselectCurrency(this.btn.id);
    }
  }
}

function selectCurrency(currency){
  ratesTable.addCurrency(currency);
  selectedCurrencies.add(currency);
  getRates(currency);
}

function unselectCurrency(currency){
  ratesTable.removeCurrency(currency);
  selectedCurrencies.remove(currency);
}

function getRates(currency){
  for (var c in selectedCurrencies.get()){
    getRate(currency,c);
  }
}

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
  // x.send();
}

function getRateRequestURL(from,to){
  var currencyPair = getKey(from,to);
  var url = "https://free.currencyconverterapi.com/api/v5/convert?q="+currencyPair+"&compact=y";
  return url;
}

function processResponse(response,from,to){
  //add code to handle response here
  //parse response HTML and find the first search result
  console.log("process xhr response");
  console.log(response);
  rate = extractRate(response,from,to);
  console.log(rate);
  rates.add(from,to,rate);
}

function extractRate(response,from,to){
  var currencyPair = getKey(from,to);
  var myObj = JSON.parse(response);
  var rate = myObj[currencyPair].val;
  return rate;
}


//============================================================================
//=============================Tabs===========================================

function addTabs(){
  createTab("Exchange",true);
  createTab("Currencies",false);
  selectDefaultTab();
  //<button class="tablinks" onclick="showTab(event, 'Exchange')" id="defaultTab">Exchange</button>
  //<button class="tablinks" onclick="showTab(event, 'Currencies')">Currencies</button>
}

function createTab(name, isDefault){
  var tabs = document.getElementById("tabs");
  var btn = document.createElement('button');
  btn.className = "tablinks";
  if(isDefault == true){
    btn.id = "defaultTab";
  }
  btn.value = name;
  btn.innerHTML = name;
  btn.onclick = "showTab(event, 'Currencies')";
  tabs.appendChild(btn);
}

function showTab(evt) {
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
    //document.getElementById(tabName).style.display = "block";
    document.getElementById(evt.currentTarget.value).style.display = "block";
    evt.currentTarget.className += " active";
}

function selectDefaultTab(){
  document.getElementById("defaultTab").click();
}

//============================================================================
//========================Global Variables and Methods========================

var selectedCurrencies = new persistentList("selectedCurrencies");
var ratesTable = new exchangeRatesTable("ratesTable");
var rates = new exchangeRates();
var currencies = new currenciesList(currenciesJSON);
var theCurrenciesTable = new currenciesTable("currenciesTable");

function main(){
  addTabs();
  theCurrenciesTable.init(3);
  addEventListeners();
}

function getKey(from,to){
  return from+"_"+to;
}

function update(){
  ratesTable.update(event);
}

function toggleSelect(){
  //theCurrenciesTable.toggle(this);
  b = new currencyButton("fromButton", this);
  b.toggle();
}

main();

//============================================================================
//============================================================================
//============================================================================

//Chrome discourages using inline javascript.
//Instead implement event listeners to add the functionality
function addEventListeners(){
  addTabClickListener();
  addAmountInputListener();
}

function addTabClickListener(){
  //Catch clicks on tabs
  var tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
      tablinks[i].addEventListener(
        'click',
        function() {showTab(event);}
      );
  }
}

function addAmountInputListener(){
  //input.innerHTML = '<input type="text" class="amount" value="" width="100%" onKeyUp="update()">';
  var amounts = document.getElementsByClassName("amount");
  console.log("Add listeners for amounts " + amounts.length);
  for (i = 0; i < amounts.length; i++) {
      amounts[i].addEventListener(
        'keyup',
        function() {update(event);}
      );
  }
}
