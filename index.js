#!/usr/bin/env node

const fetch = require('node-fetch')
const commandLineArgs = require('command-line-args')
const spreadsheet = require('google-spreadsheet')
const async = require('async');

const optionDefinitions=[
  {name:'coin', alias: 'c', type :String},
  {name:'all', alias: 'a', type: Boolean}
]

const doc = new spreadsheet('1kHiP8DNpy492cEUxp-2bRJrLWHp1mRm_q4rOnILeDag');
var sheet;

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
      
      cells.map(x => {
        if(x.col == 1 && x.value.length > 0){
          getCurrentPrice(x.value)
        }
      });
      step();
    });
  }
])

const parse = commandLineArgs(optionDefinitions)

const getCurrentPrice = async (id) => {
  const url = `https://api.coinmarketcap.com/v1/ticker/${id}/`
  const obj =  await fetch(url).then(x=> x.json())
  const res = obj[0]
  console.log(res.name + ': ' + res.price_usd + ' USD | ' + '24h Change: ' + res.percent_change_24h + '% | '  + '7D Change: ' + res.percent_change_7d + '% |' )

}

const displayHoldings = async (holdings) => {  
  for(var i=0, j=holdings.length; i<j; i++){
    getCurrentPrice(holdings[i])
  }
}

if (parse.coin){
    getCurrentPrice(parse.coin)
} else {
    runAll();
}
