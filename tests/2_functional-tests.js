const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

/**
 * Viewing one stock: GET request to /api/stock-prices/
 * Viewing one stock and liking it: GET request to /api/stock-prices/
 * Viewing the same stock and liking it again: GET request to /api/stock-prices/
 * Viewing two stocks: GET request to /api/stock-prices/
 * Viewing two stocks and liking them: GET request to /api/stock-prices/
 */

suite('Functional Tests', function() {

  suite('GET /api/stock-prices => stockData object', function() {
    test('Single Stock', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res) {
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isNotNull(res.body.stockData.price);
          assert.isNotNull(res.body.stockData.likes);
          done();
        })
    });
    test('Single Stock with Like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res) {
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isNotNull(res.body.stockData.price);
          assert.isNotNull(res.body.stockData.likes);
          assert.notEqual(res.body.stockData.likes, 0);
          done();
        })
    });
    test('Single Stock with Like AGAIN', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res) {
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isNotNull(res.body.stockData.price);
          assert.isNotNull(res.body.stockData.likes);
          assert.notEqual(res.body.stockData.likes, 0);
          done();
        })
    });

    test('Double Stock', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .end(function(err, res) {
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.equal(res.body.stockData[1].stock, 'MSFT');
          assert.exists(res.body.stockData[0].price);
          assert.exists(res.body.stockData[1].price);
          done();
        })
    });
    test('Double Stock with Like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'], like: true})
        .end(function(err, res) {
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.equal(res.body.stockData[1].stock, 'MSFT');
          assert.exists(res.body.stockData[0].price);
          assert.exists(res.body.stockData[1].price);
          assert.exists(res.body.stockData[0].rel_likes);
          assert.exists(res.body.stockData[1].rel_likes);
          done();
        })
    })
  });
});
