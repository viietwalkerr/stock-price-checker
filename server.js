'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const mongoose = require('mongoose');
const helmet = require('helmet');

// import('dotenv').config();
// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";

// import * as apiRoutes from "./routes/api.js";
// import * as fccTestingRoutes from "./routes/fcctesting.js";
// import  * as runner from "./test-runner.js";

// import mongoose from "mongoose";

const app = express();

app.use(helmet({
  // frameguard: {
  //   action: 'deny'
  // },
  contentSecurityPolicy: {
    directives: {
      // defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"]
    }
  }
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  console.log("nodenv", process.env.NODE_ENV);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

const mongoUri = process.env.DB;

mongoose.connect(mongoUri, {
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error:"));
db.once("Open", function () {
  console.log("Database Connected!");
});

module.exports = app; //for testing
