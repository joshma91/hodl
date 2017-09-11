const fetch = require('node-fetch')
const commandLineArgs = require('command-line-args')

const optionDefinitions=[
  {name:'coin', alias: 'c', type :String}
]

const parse = commandLineArgs(optionDefinitions)

const getCurrentPrice = async (id) => {
  const url = `https://api.coinmarketcap.com/v1/ticker/${id}/`
  const res =  await fetch(url).then(x=> x.json())
  console.log(res[0].price_usd + ' USD')
}

getCurrentPrice(parse.coin)

