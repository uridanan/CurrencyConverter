//https://v6.exchangerate-api.com/v6/4be7220548d61908ec476af1/latest/USD

//============================================================================

//TODO: update to read both manny key and exchangerates-api key from yacc.txt

//Get API Key from my github page to avoid resubmitting 
//the whole extension every time the key is changed (monthly)
//make sure the response is received before calling getRate()
class APIKey{
  constructor(){
    this.theKey = "NO KEY YET";
    this.theBackupKey = "NO KEY YET"
    this.url = "https://uridanan.github.io/yacc.txt";
  }

  fetch(){    
    var x = new XMLHttpRequest();
    x.overrideMimeType('text');  
    x.open('GET', this.url);
    x.onreadystatechange = function() {
      if (x.readyState == 4 && x.status == 200) {
        //processResponse(x.responseText,from,to);
        console.log(x.responseText);        
        theAPIKey.set(x.responseText);
        deferred_main();
      }
    };
    x.send();

  }

  //TODO: test what happens when there is no comma or no second key
  //TODO: try json instead?
  set(value){
  	var keys = value.split(',');
    this.theKey = keys[0];
    this.theBackupKey = keys[1];
  }

  get(){
    return this.theKey;
  }

  getBackup(){
  	return this.theBackupKey;
  }

}



//Get exchange rates from exchangerates-api
function getRates(from){
  var url = getRatesRequestURL(from);
  var x = new XMLHttpRequest();
  x.overrideMimeType('text/json');
  console.log("getRate from: " + url);
  x.open('GET', url);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      processRatesResponse(x.responseText);
      //alert(x.responseText);
    }
  };
  x.send();
}


//Make sure the response from getAPIKey() was received
const apiKey = '4be7220548d61908ec476af1'; // Replace with your actual API key
function getRatesRequestURL(from){
  //var url = "https://v6.exchangerate-api.com/v6/"+theAPIKey.getBackup()+"/latest/"+from;
  var url = "https://v6.exchangerate-api.com/v6/"+apiKey+"/latest/"+from;
  return url;
}



function processRatesResponse(response){
  //add code to handle response here
  //parse response HTML and find the first search result
  console.log("process xhr response");
  console.log(response);
  jsonRates = extractRates(response);
  console.log(jsonRates);
  // rates.set(from,to,rate);
  // ratesTable.computeValueForActiveCurrency(to,from);
}

function extractRates(response){
  var myObj = JSON.parse(response);
  var ratesDict = myObj["conversion_rates"];
  var from = myObj["base_code"];
  console.log(ratesDict);
  for (var to of Object.keys(ratesDict)){
  	var rate = ratesDict[to];
  	if(from != to){
  		rates.set(from,to,rate);
  		ratesTable.computeValueForActiveCurrency(to,from);
  	}
  }
}
 
////////////////////////////
async function getExchangeRate(apiKey, fromCurrency, toCurrency) {
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    const rate = data.conversion_rates[toCurrency];
    if (!rate) {
      throw new Error('Conversion rate not found.');
    }
    return rate;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
  }
}

// Usage example
//const apiKey = '4be7220548d61908ec476af1'; // Replace with your actual API key
const fromCurrency = 'USD'; // For example, converting from USD
const toCurrency = 'EUR'; // to EUR

// getExchangeRate(apiKey, fromCurrency, toCurrency)
//   .then(rate => console.log(`Exchange rate from ${fromCurrency} to ${toCurrency}:`, rate))
//   .catch(error => console.error(error));
////////////////////////////


getRates("USD");