//getCurrencies.js

function populateCurrenciesTable(jsonInput) {
    var table = document.getElementById("currenciesTable");
    var rowIndex = 0;
    for (var currency in jsonInput)
    {
      //Option element is to create a dropdown
      //var option = document.createElement('option');
      //option.value = currency;
      //option.text = currenciesJSON[currency].name;
      //select_currency.appendChild(option);
      var row = table.insertRow(rowIndex++);
      var cell = row.insertCell(0);
      cell.id = currency;
      cell.className = "currencyBox";
      cell.innerHTML = "<button onclick='myFunction("+cell.id+")'><span class='currencySymbol'>"+currency+"</span><br><span class='currencyName'>"+jsonInput[currency].name+"</span></button>";
    }

}

function myFunction(element) {
    var cell = document.getElementById(element.id);
    //cell.className = "selectedCurrencyBox";
    cell.classlist.toggle("selectedCurrencyBox");
}

populateCurrenciesTable(currenciesJSON);
