"use strict";
var request = require('request');
let utils = require("../utils/webUtils");
const rp = require('request-promise');
const jwt = require ('jsonwebtoken');
var mysql = require('mysql');
var bcrypt = require ('bcryptjs');

var pool      =    mysql.createPool({
  connectionLimit : 100, //important
  host     : 'dashdatabase.cshqrg6tymlg.us-west-2.rds.amazonaws.com',
  user     : 'dashadmin',
  password : 'dashmaster8766',
  database : 'dashadmin',
  debug    :  false
});


module.exports = {
    //DASH ID FOR CMC 131
    login: (req, res) => {
      let data = req.body;
      let reqEmail =data.Email;
      let reqPassword =data.Password;
      findUserByEmail(reqEmail).then(data=>{
        bcrypt.compare(reqPassword, data.Password, (errbcrypt, bcryptres) => {
          if(bcryptres===true)return utils.respondWithResults(res, 200)({user:data.user,token:data.token, currency:data.currency})
          else return utils.errorHandler(res, 500)('Email/Password mismatched');
        });
      }).catch((error)=>{
        return utils.errorHandler(res, 500)(error);
      })
    },

    signIn: (req, res) => {
      let data = req.body;
      let reqName =data.Name;
      let reqLastName =data.LastName;
      let reqEmail =data.Email;
      let reqPassword =data.Password;
      let reqDashAddress =data.DashAddress;
      let reqCountry =data.Country;
      let reqCurrency =data.Currency;
      createNewUser(reqName,reqLastName,reqEmail,reqPassword,reqDashAddress,reqCountry,reqCurrency).then(data=>{
        return utils.respondWithResults(res, 200)(data)
      }).catch((error)=>{
        return utils.errorHandler(res, 500)(error);
      })
    },

    validateToken: (req, res) => {
      let data = req.body;
      let reqToken =data.token;
      jwt.verify(reqToken, 'thisismysecretcaicuid', function(err, decoded) {
        if (err) {
          return utils.errorHandler(res, 500)(false);
        }
        else{
          return utils.respondWithResults(res, 200)(true);
        }
      });
    },

    tableData: (req, res) => {
      let data = req.body;
      let reqToken =data.token;
      let reqemail =data.user;
      //console.log(reqToken,reqemail);
      jwt.verify(reqToken, 'thisismysecretcaicuid', function(err, decoded) {
        if (err) {
          return utils.errorHandler(res, 500)(false);
        }
        else{ //CHECK DATA ON QUERY
          var SQL = 'SELECT Contrato, MontoDash, MontoFiat,TipoFiat,Status,DateCompleted,Hash FROM txinfo,User WHERE User.email = ? AND txinfo.FK_UserId = User.id';
          pool.query(SQL, [reqemail], function(err, rows, fields) {
            if (err){
              console.log(err);
              return utils.respondWithResults(res, 500)({message:'No Data'});
              //reject({ code:err.errno.toString(),message:err.sqlMessage});
            }
            if (rows.length != 0)
            {
              console.log('datafound')
              return utils.respondWithResults(res, 200)(rows);
            }
            else{
              return utils.respondWithResults(res, 500)({message:'No Data'});
            }
          });

        }
      });
    },

    newDashTx: (req, res) => {
      let data = req.body;
      console.log(data);
      let reqEstablecimiento =data.establecimiento;
      let reqMonto =data.monto;
      let reqContrato =data.contrato;
      let reqCurrency =data.currency;
      callToPP(reqEstablecimiento,reqMonto,reqContrato,reqCurrency).then(data=>{ // PP = Payment Processor
        return utils.respondWithResults(res, 200)(data)
      }).catch((error)=>{
        return utils.errorHandler(res, 500)(error);
      })
    }
    
}

const findUserByEmail = (userEmail) => {
  return new Promise ((resolve,reject) => {
    var SQL = 'SELECT * FROM User WHERE email = ?';
    pool.query(SQL, [userEmail], function(err, rows, fields) {
      if (err){
        //1062 email already exists.
        reject({ code:err.errno.toString(),message:err.sqlMessage});
      }
      if (rows.length != 0)
      {
        const token = jwt.sign({_id:rows[0].Email},'thisismysecretcaicuid',{expiresIn: '5 minutes'});
        resolve({user:rows[0].email,
                token:token,
                currency:rows[0].Currency,
                Password:rows[0].Password});
      }
      else{
        reject({ code:404,message:'Email/Password mismatched'});
      }
    });
  })

  

  //////////////////////////////////////////////////////////////// Try/catch example - Start
 /* pool.query(SQL, [userEmail], function(err, rows, fields) {
    if (rows == undefined){
       throw new Error('Error while performing Query');
    }
    if (rows.length != 0)
    {
      return {User: rows[0]};
    }
    else{
      throw new Error('Not found');
    }
  });*/
  //////////////////////////////////////////////////////////////// Try/catch example - End
};



const createNewUser = (userName,userLastName,userEmail,userPassword,userDashAddress,Country,Currency) => {
  return new Promise ((resolve,reject) => {
    bcrypt.hash(userPassword, 8, (errbcrypt, hash) => {
        var SQL = 'INSERT INTO User (Name, LastName, email, Password, DashAddress, Country, Currency) VALUES (?,?,?,?,?,?,?)';
        pool.query(SQL, [userName,userLastName,userEmail,hash,userDashAddress, Country, Currency], function(err, rows, fields) {
            if (err){
              //1062 email already exists.
              reject({ code:err.errno.toString(),message:err.sqlMessage});
            }
            else{
              const token = jwt.sign({_id:userEmail},'thisismysecretcaicuid',{expiresIn: '10 minutes'})
              resolve({user:userEmail,
                      currency:Currency,
                      token:token});
            }
          });
      });
   });
}


const callToPP = (establecimiento, monto, contrato, currency) => {
  return new Promise ((resolve,reject) => {
    request.get({
      url: 'http://pp.dashhelpme.io/',
      qs: { 
        idestablecimiento:establecimiento,
        monto:monto,
        contrato:contrato,
        currency:currency
      },
      method: 'GET'
     },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //console.log(body);
            resolve({result:"Success"});
          }
          else{
            //console.log(body);
            reject({result:"Fail"});
          }
      });
   });
}



