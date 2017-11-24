#!/usr/bin/env node

const fetch = require("node-fetch");
const commandLineArgs = require("command-line-args");
const spreadsheet = require("google-spreadsheet");
const async = require("async");

const optionDefinitions = [
  { name: "coin", alias: "c", type: String },
  { name: "all", alias: "a", type: Boolean },
  { name: "worth", alias: "w", type: Boolean }
];

const doc = new spreadsheet("1kHiP8DNpy492cEUxp-2bRJrLWHp1mRm_q4rOnILeDag");
const parse = commandLineArgs(optionDefinitions);
var sheet;
var total = 0;

const runAll = () =>
  async.series([
    function setAuth(step) {
      const creds = require("/home/josh/Downloads/finances-b921f81fc8fc.json");
      doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
      doc.getInfo(function(err, info) {
        sheet = info.worksheets[0];

        step();
      });
    },
    function workingWithCells(step) {
      sheet.getCells(
        {
          "min-row": 1,
          "max-row": 10,
          "min-col": 1,
          "max-col": 7,
          "return-empty": true
        },
        async function(err, cells) {
          const coinNames = cells
            .filter(x => x.col === 1)
            .filter(x => x.value.length > 0)
            .map(x => x.value);

          const numCoins = cells
            .filter(x => x.col === 2)
            .filter(x => x.value.length)
            .filter(x => x.value !== "Num")
            .map(x => x.value);

          const zip = (a, b) => a.map((ele, idx) => [ele, b[idx]]);

          const x = zip(coinNames, numCoins);

          const promises = x.map(item => getCurrentPrice(item[0], item[1]));

          let totalValue = [];

          const result = await Promise.all(promises);
          result.forEach(x => {
            const numCoinsInFloat = parseFloat(x.numCoins.replace(",", ""));
            const value = numCoinsInFloat * x.price * 1.27;
            totalValue.push(value);
            console.log(
              `${x.name}: ${x.price} USD | 24h Change: ${
                x.percentChange
              }% | Value: ${value} `
            );
          });

          const output = totalValue.reduce((a, b) => a+b ,0)
          console.log("Total profit: $" + parseFloat(output).toFixed(2));

          step();
        }
      );
    }
  ]);

const getCurrentPrice = async (id, numCoins) => {
  const url = `https://api.coinmarketcap.com/v1/ticker/${id}/`;
  const obj = await fetch(url).then(x => x.json());
  const res = obj[0];

  const numCoinsInFloat = parseFloat(numCoins.replace(",", ""));
  const valueInCAD = numCoinsInFloat * res.price_usd * 1.27;
  outStr =
    res.name +
    ": " +
    res.price_usd +
    " USD | " +
    "24h Change: " +
    res.percent_change_24h +
    "% | " +
    "Value: " +
    valueInCAD;
  // total += valueInCAD;
  return {
    name: res.name,
    price: res.price_usd,
    percentChange: res.percent_change_24h,
    numCoins
  };
};

if (parse.coin) {
  getCurrentPrice(parse.coin, "0");
} else {
  runAll();
}
