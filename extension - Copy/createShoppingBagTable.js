//createShoppingBagTable.js

////////////////////////////////////////////////////////////////////////////////
//Create table from shopping bag object
////////////////////////////////////////////////////////////////////////////////

function createShoppingBagTable(shoppingbagobject){
  //Copy bag to HTML document
  shoppingbagtable = getItems(shoppingbagobject);
  shoppingbagitems = shoppingbagtable.outerHTML;
  chrome.runtime.sendMessage({"message": "onshoppingbagready"});
}

function getItems(shoppingbagobject){
  var table = document.createElement('table');
  //table.style.border = "1";table.border = "1";
  table.style.width ="100%";table.width ="100%";

  var items = getItemRows(shoppingbagobject);
  if(items.length == 0){
    table.innerHTML = shoppingbagobject.outerHTML;
  }
  for (var i in items) {
    if (items.hasOwnProperty(i)) {
      var row = table.insertRow(i);

      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);

      // Add some text to the new cells:
      cell1.innerHTML = getItemImage(items[i]);
      cell2.innerHTML = getItemText(items[i]);
    }
  }
  return table;
}

function getItemRows(shoppingbagobject){
  //Handle the items rows: class name is bglight
  return shoppingbagobject.getElementsByClassName("bgLight");
}

function getItemImage(item){
  var basketImage = item.getElementsByClassName("basketImage");
  if(basketImage != null && basketImage.length > 0){
    return basketImage[0].innerHTML;
  }
}

function getItemText(item){
  var basketDesc = item.getElementsByClassName("basketDesc");
  if(basketDesc != null && basketDesc.length > 0){
        var text = basketDesc[0].innerText;
        var cat = extractCatalogNumber(text);
        var desc = extractDescription(text);
        return desc + "<br>" + cat;
  }
}

function getSelectedText(cell){
  return cell.options[cell.selectedIndex].text;;
}


////////////////////////////////////////////////////////////////////////////////
//Extract shopping bag items from shopping cart view
//ViewCart URL passed as parameter because you can't get it from background
////////////////////////////////////////////////////////////////////////////////
function getShoppingCartView(url){
  var x = new XMLHttpRequest();
  x.overrideMimeType('text/xml');
  console.log("getShoppingCartView");
  console.log(url);
  x.open('GET', url);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      processViewCartResponse(x.responseText);
      //alert(x.responseText);
    }
  };
  x.send();
}

function processViewCartResponse(response){
  var text = extractOrderCellsTable(response);
  console.log(text);
  var objects = jQuery.parseHTML(text);
  createShoppingBagTable(objects[0]);
}

function extractOrderCellsTable(response){
  //Extract the relevant div then convert into xmlDoc
  start = response.search("<table class=\"orderCells\"");
  if(start == -1){
    //No table found
    return "<tr width=\"100%\" align=\"center\"><td width=\"100%\" align=\"center\">Your shopping bag is empty</td></tr>";
  }
  eod = response.length-1;
  substr = response.substring(start,eod);
  end = substr.search("</table>");
  text = substr.substring(0,end+8);
  return text;
}
