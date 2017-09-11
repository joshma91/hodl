const fetch = require('node-fetch')
const commandLineArgs = require('command-line-args')

const optionDefinitions=[
  {name:'coin', alias: 'c', type :String}
]

const parse = commandLineArgs(optionDefinitions)

const getCurrentPrice = async (id) => {
  const url = `https://api.coinmarketcap.com/v1/ticker/${id}/`
  const obj =  await fetch(url).then(x=> x.json())
  const res = obj[0]
  console.log(res.price_usd + ' USD | ' + '24h Change: ' + res.percent_change_24h + '%')
}

getCurrentPrice(parse.coin)

