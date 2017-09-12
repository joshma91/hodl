const fetch = require('node-fetch')
const commandLineArgs = require('command-line-args')

const optionDefinitions=[
  {name:'coin', alias: 'c', type :String},
  {name:'all', alias: 'a', type: Boolean}
]

var myHoldings = [
  "ethereum",
  "neo",
  "zencash",
  "binance-coin",
  "metal",
  "tenx",
  "rise"
]

const parse = commandLineArgs(optionDefinitions)

const getCurrentPrice = async (id) => {
  const url = `https://api.coinmarketcap.com/v1/ticker/${id}/`
  const obj =  await fetch(url).then(x=> x.json())
  const res = obj[0]
  console.log(res.name + ': ' + res.price_usd + ' USD | ' + '24h Change: ' + res.percent_change_24h + '%')
  return res
}

const displayHoldings = async (holdings) => {  
  for(var i=0, j=holdings.length; i<j; i++){
    getCurrentPrice(holdings[i])
  }
}

if (parse.all) displayHoldings(myHoldings)
if (parse.coin) getCurrentPrice(parse.coin)
