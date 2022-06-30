'use strict';
const StockModel = require("../models").Stock;
var chai = require("chai"), chaiHttp = require("chai-http");

async function createStock(stock, like, ip) {
  const newStock = new StockModel({
    symbol: stock,
    likes: like ? [ip] : [],
  });
  const saved = await newStock.save();
  return saved;
}

async function findStock(stock) {
  console.log("Finding One");
  return await StockModel.findOne({ symbol: stock }).exec();
}

async function updateStock(stock, like, ip) {
  let saved = {};
  const stockFound = await findStock(stock);
  if (!stockFound) {
    const create = await createStock(stock, like, ip);
    saved = create;
    return saved;
  } else {
    if (like && stockFound.likes.find(ipAddress => ipAddress === ip) === undefined) {
      stockFound.likes.push(ip);
    } 
    // else if (like && stockFound.likes.find(ipAddress => ipAddress === ip) !== undefined) {
    //   const index = stockFound.likes.indexOf(ip);
    //   stockFound.likes.splice(index, 1);
    // }
    // if (like && stockFound) {
    //   stockFound.likes.push(ip);
    // }
    saved = await stockFound.save();
    return saved;
  }
}

async function getStock(stock) {
  // const response = await get(
  //   `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  // );
  const response = await chai.request(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  ).get('/');
  const { symbol, latestPrice } = await response.body;
  return { symbol, latestPrice };
}

module.exports = function (app) {

  chai.use(chaiHttp);

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock, like } = req.query;
      if (typeof stock !== "string") {
        const stock1 = await getStock(stock[0]);
        const stock2 = await getStock(stock[1]);

        const stockData1 = await updateStock(stock1.symbol, like, req.ip);
        const stockData2 = await updateStock(stock2.symbol, like, req.ip);
        console.log("Saving double Stock Data");

        res.json({
          stockData: [
            {
              stock: stock1.symbol,
              price: stock1.latestPrice,
              rel_likes: stockData1.likes.length - stockData2.likes.length
            },
            {
              stock: stock2.symbol,
              price: stock2.latestPrice,
              rel_likes: stockData2.likes.length - stockData1.likes.length
            }
          ]
        })

      } else {
        const { symbol, latestPrice } = await getStock(stock);
        if (!symbol) {

          res.json({ stockData: { likes: like ? 1 : 0 }});
          return;
        }
  
        const stockData = await updateStock(symbol, like, req.ip);
        console.log("Saving single Stock Data", stockData);
  
        res.json({
          stockData: {
            stock: symbol,
            price: latestPrice,
            likes: stockData.likes.length,
          },
        });
        
      }
    });
    
};
