//getCurrencies.js

function populateCurrenciesTable(jsonInput,rowSize) {
  var table = document.getElementById("currenciesTable");
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
    var cName = jsonInput[currency].currencyName;


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

function createCurrencyButton(symbol){
  var btn = document.createElement('button');
  btn.className = "currencyBox";
  btn.id = symbol;
  btn.value = symbol;
  btn.setAttribute('selected',0);
  btn.onclick = toggleSelect;
  btn.innerHTML = getCurrencySymbolHTML(symbol)+"<br>"+getCurrencyNameHTML(symbol);
  return btn;
}

function getCurrencyButtonHTML(symbol){
  html = "<button class='currencyBox' id='"+symbol+"' value='"+symbol+"' selected=0 onclick='toggleSelect()'>"+getCurrencySymbolHTML(symbol)+"<br>"+getCurrencyNameHTML(symbol)+"<button>";
  return html;
}

function getCurrencyNameHTML(symbol){
  return "<span class='currencyName'>"+getCurrencyDisplayName(symbol)+"</span>";
}

function getCurrencySymbolHTML(symbol){
  return "<span class='currencySymbol'>"+symbol+"</span>";
}

function toggleSelect(){
  //var id = this.id;
  //var btn = document.getElementById(id);
  var btn = this;
  var status = btn.getAttribute('selected');
  if(status == "0"){
    btn.className = "selectedCurrencyBox";
    btn.setAttribute('selected',1);
    selectCurrency(btn.id);
  } else {
    btn.className = "currencyBox";
    btn.setAttribute('selected',0);
    removeCurrency(btn.id);
  }

}

populateCurrenciesTable(currenciesJSON,3);
