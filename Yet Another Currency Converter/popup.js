//popup.js
//https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y
//Expiration for local storage: https://gist.github.com/anhang/1096149

//============================================================================
//============================================================================
// TODO:
//Error 403 probably becasue too many calls, the getRates refactor might actually work
//Refactor tabs
//Adaptive height?
//Move symbol to the left of the amounts

//Package extension
//Marketing Page
//Publish

//============================================================================
//===============A class to store the selected currencies=====================
class persistentDict {
  //timeout = 0 means the entries never expire
  constructor(name,timeoutMin) {
    this.entries = {};
    this.name = name;
    this.timeout = timeoutMin * 60 * 1000; // save timeout in msec
    this.load();
  }

  now(){
    return new Date().getTime();
  }

  getTimeout(){
    if(this.timeout == 0){
      return 0;
    }
    else{
      return this.now() + this.timeout;
    }
  }

  add(key,value){
    var entry = {};
    var timeout = this.getTimeout();
    entry["value"] = value;
    entry["timeout"] = timeout;
    this.entries[key] = entry;
    this.save();
  }

  get(key){
    var entry = this.entries[key];
    var value = undefined;
    if(entry != undefined){// && !this.isExpired(entry["timeout"])){
      value = entry["value"];
    }
    return value;
  }

  isExpired(timeout){
    var now =  this.now();
    return (timeout > 0 && now > timeout);
  }

  remove(key){
    delete this.entries[key];
    this.save();
  }

  getAll(){
    var entries = this.entries;
    var values = {};
    for(var k in entries){
      var e = entries[k];
      values[e.value] = e.value;
    }
    return values;
  }

  save(){
    var json = JSON.stringify(this.entries);
    localStorage.setItem(this.name, json);
  }

  removeExpiredEntries(){
    var keys = Object.keys(this.entries);
    for (var i in keys){
      this.removeIfExpired(keys[i])
    }
  }

  removeIfExpired(key){
    var entry = this.entries[key];
    if(this.isExpired(entry.timeout)){
      this.remove(key);
    }
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

    this.removeExpiredEntries();
  }

}

//============================================================================
//=================A class to compute and store exchaange rates===============
class exchangeRates {
  constructor() {
    this.mExchangeRates = new persistentDict("exchangeRates",60);
  }

  set(from,to,rate){
    if(rate == 0 || rate == undefined){
      return;
    }
    var fromto = getKey(from,to);
    var tofrom = getKey(to,from);
    this.mExchangeRates.add(fromto,rate);
    this.mExchangeRates.add(tofrom,1/rate);
  }

  get(from,to){
    var fromto = getKey(from,to);
    return this.mExchangeRates.get(fromto);
  }

  add(from,to){
    //console.log("Add rate from "+from+" to "+to);
    //Special case: identity pair, rate is 1
    if(from.localeCompare(to) == 0){
      this.set(from,to,1);
    }

    //If the entry does not already exist, call REST api
    var rate = this.get(from,to);
    if(rate == undefined){
      //Entry will be added by the callback
      //console.log("Send XHR request for rate from "+from+" to "+to);
      getRate(from,to);
    }
    else{
      //If the rate is already available compute the value
      console.log("Rate from "+from+" to "+to+" already available: "+rate);
      ratesTable.computeValue(from);
    }
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
    //Insert the actual row
    var name = currencies.getCurrencyDisplayName(symbol);
    var row = this.getElement().insertRow(0);
    var cell = row.insertCell(0);
    row.setAttribute("currency",symbol);
    cell.className = "exchangeCell";
    var currencyString = name; //symbol+": "+name;
    var inputHTML = '<input type="text" class="amount" value="">';
    cell.innerHTML = currencyString + '<br>' + inputHTML;
    //input.innerHTML = '<input type="text" class="amount" value="" width="100%">';
    //input.innerHTML = '<input type="text" class="amount" value="" width="100%" onKeyUp="update()">';
    //Listen to onKeyUp events
    addAmountInputListenerToElement(cell.children[1]);
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
    for (var c in selectedCurrencies.getAll()){
      this.computeValue(c);
    }
  }

  getCurrencyRow(symbol){
    var row = this.getElement().querySelector('[currency="'+symbol+'"]');
    return row;
  }

  setValue(symbol,value){
    var row = this.getCurrencyRow(symbol);
    row.children[0].children[1].value = value.toFixed(2);
  }

  computeValueForActiveCurrency(baseCurrency, targetCurrency){
      //ProcessResponse will return for all pairs
      //We only want to compute the value only for the active currency
      if(this.isActiveCurrency(baseCurrency)){
        this.computeValue(targetCurrency);
      }
    }

  //Compute value from currently active base currency to newly added currency
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
    var symbol = " (" + id + ")";
    if (this.currencies[id].currencySymbol != undefined){
      symbol = " (" + this.currencies[id].currencySymbol + ")";
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
    this.buttons = {};
    this.rowSize = 0;
  }

  getElement(){
    return document.getElementById(this.id);
  }

  init(rowSize){
    this.rowSize = rowSize;
    this.initCurrencyButtons();
    this.showTable("");
    this.loadSelectedCurrencies();
  }

  initCurrencyButtons(){
    var keys = currencies.getAll();
    for (var i in keys) {
      //Option element is to create a dropdown
      //var option = document.createElement('option');
      //option.value = currency;
      //option.text = currenciesJSON[currency].name;
      //select_currency.appendChild(option);
      var currency = keys[i];
      var button = new currencyButton("fromSymbol",currency);
      this.buttons[i] = button;
    }
  }

  refreshTable(filter){
    this.clearTable();
    this.showTable(filter);
  }

  showTable(filter){
    var table = this.getElement();
    var rowIndex = 0;
    var cellIndex = 0;
    var row = table.insertRow(rowIndex++); //init table with first row
    for (var i in this.buttons) {
      var btn = this.buttons[i];
      if(btn.show(filter)){
        var cell = row.insertCell(cellIndex++);
        cell.appendChild(btn.instance());
        if(cellIndex == this.rowSize){
          row = table.insertRow(rowIndex++);
          cellIndex = 0;
        }
      }
    }
  }

  loadSelectedCurrencies(){
    //selectedCurrencies.load();
    var currencies = selectedCurrencies.getAll();
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

  //https://www.w3schools.com/howto/howto_js_filter_lists.asp
  //https://www.w3schools.com/jquery/jquery_filters.asp
  //https://www.w3schools.com/jsref/jsref_filter.asp
  filterCurrencies(filter){
    this.refreshTable(filter);
  }

  clearTable(){
    var table = this.getElement();
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
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
      var searchTags = param + ';' + currencies.getCurrencyName(param);
      btn.setAttribute("searchTags",searchTags);
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

  show(filter){
    var searchTags = this.btn.getAttribute("searchTags");
    return (searchTags != undefined && searchTags.toLowerCase().indexOf(filter) > -1);
  }
}

function selectCurrency(currency){
  ratesTable.addCurrency(currency);
  selectedCurrencies.add(currency,currency);
  getRates(currency);
  //Can't compute the value here because the rate might not be available yet
}

function unselectCurrency(currency){
  ratesTable.removeCurrency(currency);
  selectedCurrencies.remove(currency);
}

function getRates(currency){
  for (var c in selectedCurrencies.getAll()){
    console.log("Add currency pair: "+currency+"_"+c);
    if(currency != undefined && c != undefined){
      rates.add(currency,c);
      //getRate(currency,c);
    }
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
  x.send();
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
  rates.set(from,to,rate);
  ratesTable.computeValueForActiveCurrency(to,from);
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
    btn.clientidmode = "Static";
  }
  btn.value = name;
  btn.innerHTML = name;
  //btn.onclick = "showTab(event, 'Currencies')";
  if (tabs != null && tabs != undefined){
    tabs.appendChild(btn);
  }
}

function showTab(tab) {

  if (tab == null || tab == undefined){
    return;
  }
    
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
  //document.getElementById(evt.currentTarget.value).style.display = "block";
  //evt.currentTarget.className += " active";
  document.getElementById(tab.value).style.display = "block";
  tab.className += " active";

  toggleSearchBar(tab);
}

function selectDefaultTab(){
  var defaultTab = document.getElementById("defaultTab");
  showTab(defaultTab);
}


function hideSearchBar(){
  var searchBar = document.getElementById("filterBar");
  searchBar.style.display = "none";
}

function showSearchBar(){
  var searchBar = document.getElementById("filterBar");
  searchBar.style.display = "block";
}


function toggleSearchBar(tab){
  if(tab.value == "Currencies"){
    this.showSearchBar();
  }
  else{
    this.hideSearchBar();
  }
}

//============================================================================
//========================Global Variables and Methods========================

var selectedCurrencies = new persistentDict("selectedCurrencies",0);
var ratesTable = new exchangeRatesTable("ratesTable");
var rates = new exchangeRates();
var currencies = new currenciesList(currenciesJSON);
var theCurrenciesTable = new currenciesTable("currenciesTable");

function main(){
  addTabs();
  theCurrenciesTable.init(2);
  addEventListeners();
}

function getKey(from,to){
  return from+"_"+to;
}

function update(){
  ratesTable.update(event);
}

function filterCurrencies(e){
  var input = e.currentTarget;
  var value = input.value;
  console.log(value);
  if(value == undefined){
    value = "";
  }
  theCurrenciesTable.filterCurrencies(value.toLowerCase());
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
  addTabClickListeners();
  addAmountInputListeners();
  addSearchInputListener();
}

function addTabClickListeners(){
  //Catch clicks on tabs
  var tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
      tablinks[i].addEventListener(
        'click',
        function() {showTab(event.currentTarget);}
      );
  }
}

function addAmountInputListeners(){
  //input.innerHTML = '<input type="text" class="amount" value="" width="100%" onKeyUp="update()">';
  var amounts = document.getElementsByClassName("amount");
  console.log("Add listeners for amounts " + amounts.length);
  for (i = 0; i < amounts.length; i++) {
      addAmountInputListenerToElement(amounts[i]);
  }
}

function addAmountInputListenerById(id){
  var amount = document.getElementById(id);
  addAmountInputListenerToElement(amount);
}

function addAmountInputListenerToElement(e){
  e.addEventListener('keyup',function() {update(event);});
}

function addSearchInputListener(){
  var filter = document.getElementById("filter");
  filter.addEventListener('keyup',function() {filterCurrencies(event);});
}
