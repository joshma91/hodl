#!/usr/bin/env node

const fetch = require('node-fetch')
const commandLineArgs = require('command-line-args')
const spreadsheet = require('google-spreadsheet')
const async = require('async');

const optionDefinitions=[
  {name:'coin', alias: 'c', type :String},
  {name:'all', alias: 'a', type: Boolean},
  {name:'worth', alias: 'w', type: Boolean}
]

const doc = new spreadsheet('1kHiP8DNpy492cEUxp-2bRJrLWHp1mRm_q4rOnILeDag');
const parse = commandLineArgs(optionDefinitions)
var sheet;
var total = 0;

const runAll = () => async.series([
  function setAuth(step){
    const creds = require('/home/josh/Downloads/finances-b921f81fc8fc.json');
    doc.useServiceAccountAuth(creds, step);
  },
  function getInfoAndWorksheets(step) {
    doc.getInfo(function(err, info) {
      sheet = info.worksheets[0];
      
      step();
    });
  },function workingWithCells(step) {
    sheet.getCells({
      'min-row': 1,
      'max-row': 10,
      'min-col': 1,
      'max-col':7,
      'return-empty': true
    }, function(err, cells) {
      
      let promises = cells.map( async (x, index, array) => {
        if(x.col == 1 && x.value.length > 0){
          const numCoins = array[index+1].value;
          await getCurrentPrice(x.value, numCoins);
        }
      })
      Promise.all(promises).then(() => console.log('Total profit: $' + parseFloat(total-35820).toFixed(2)));
            
      step();
    });
  }
])

const getCurrentPrice = async (id, numCoins) => {
  const url = `https://api.coinmarketcap.com/v1/ticker/${id}/`
  const obj =  await fetch(url).then(x=> x.json())
  const res = obj[0]
  
  if(parse.worth) {
    const numCoinsInFloat = parseFloat(numCoins.replace(',', ''))
    const valueInCAD = numCoinsInFloat*res.price_usd*1.27;
    outStr = res.name + ': ' + res.price_usd + ' USD | ' + '24h Change: ' + res.percent_change_24h + '% | '  + 'Value: ' + valueInCAD;
    total += valueInCAD;
  } else {
    outStr = res.name + ': ' + res.price_usd + ' USD | ' + '24h Change: ' + res.percent_change_24h + '%'; 
  }
  console.log(outStr)
}

if (parse.coin){
    getCurrentPrice(parse.coin)
} else {
    runAll();
}
