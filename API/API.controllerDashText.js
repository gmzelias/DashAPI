"use strict";
var request = require('request');
let utils = require("../utils/webUtils");
const rp = require('request-promise');
const jwt = require ('jsonwebtoken');
var mysql = require('mysql');
var pool      =    mysql.createPool({
  connectionLimit : 100, //important
  host     : 'dashdatabase.cshqrg6tymlg.us-west-2.rds.amazonaws.com',
  user     : 'dashadmin',
  password : 'dashmaster8766',
  database : 'dashadmin',
  debug    :  false
});

const requestDynamicAddress = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
    qs: {
      'id': '131'
    },
    headers: {
      'X-CMC_PRO_API_KEY': 'e15c0e32-88d7-46e5-8a14-20113c9c2f8e'
    },
    json: true,
    gzip: true
  };


module.exports = {
    //DASH ID FOR CMC 131
    login: (req, res) => {
      console.log(req.email);
      /*pool.query('SELECT id FROM User WHERE email = '+req.email+' ORDER BY ID DESC LIMIT 1', function(err, rows, fields) {
        if (rows == undefined){

        }
        if (rows.length != 0)
        {
          return utils.errorHandler(res, 500)({error});
        }
      });
      const jwtToken = jwt.sign({},'thisisaDashrandomsentencefortheAPI')*/
    }

}