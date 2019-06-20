"use strict";
var request = require('request');
let utils = require("../utils/webUtils");
//let jwt = require('jsonwebtoken');

module.exports = {
    //DASH ID FOR CMC 131
    dashUsdBss: (req, res) => {
        var trustedIps = ['::1'];
        var requestIP = req.ip;
       /* console.log(req.ip);
        console.log(req.connection.remoteAddress);*/
        if(trustedIps.indexOf(requestIP) >= 0) {  //No request allow from unknown IPs
            console.log('Allowed');
            const rp = require('request-promise');

            const requestCMC = {
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

            const requestCoinCap = {
              method: 'GET',
              uri: 'https://api.coincap.io/v2/assets/dash',
              json: true,
              gzip: true
            };

            const requestCoinGecko = {
              method: 'GET',
              uri: 'https://api.coingecko.com/api/v3/simple/price?ids=dash&vs_currencies=usd',
              json: true,
              gzip: true
            };

            const requestDolarToday = {
              method: 'GET',
              uri: 'https://s3.amazonaws.com/dolartoday/data.json',
              json: true,
              gzip: true
            };

            const requestYadio = {
              method: 'GET',
              uri: 'https://api.yadio.io/json/',
              json: true,
              gzip: true
            };

            const requestBasicChange = { //Formula needed
              method: 'GET',
              uri: 'https://basichange.com/api/v1/get/concurrency/dash',
              json: true,
              gzip: true
            };

            const requestBitVzla = { //Formula needed (check if VEF)
              method: 'GET',
              uri: 'https://api.bitcoinvenezuela.com/',
              json: true,
              gzip: true
            };

            let arrayVesPrices = [];
            const arrAvg = arrayVesPrices => arrayVesPrices.reduce((a,b) => a + b, 0) / arrayVesPrices.length;

            rp(requestCMC).then((responseCMC) => {


                let usdRateCMC = responseCMC['data']['131']['quote']['USD']['price'].toFixed(3);
                console.log('From CoinMarketCap',usdRateCMC);
                  //Request DolarToday
                return rp(requestDolarToday).then((responseDolarToday)=>{
                  let vesDolarToday = parseFloat(responseDolarToday['USD']['bitcoin_ref'].toFixed(3));
                  console.log(typeof vesDolarToday);
                  arrayVesPrices.push(vesDolarToday);
                  console.log('VES DolarToday ',vesDolarToday);
                  //Request Yadio
                return rp(requestYadio).then((responseYadio)=>{
                  let vesYadio = parseFloat(responseYadio['USD']['rate'].toFixed(3));
                  arrayVesPrices.push(vesYadio);
                  console.log('VES Yadio ',vesYadio);
                  //Request BasicChange
                return rp(requestBasicChange).then((responseBasicChange)=>{         
                  let vesBasicChange = parseFloat((responseBasicChange['data']['rate_buy'] / responseBasicChange['data']['price_usd']).toFixed(3));
                  arrayVesPrices.push(vesBasicChange);
                  console.log('VES BasicChange ',vesBasicChange);
                  //Request BitVzla
                return rp(requestBitVzla).then((responseBitVzla)=>{         
                  let vesBitVzla = parseFloat(responseBitVzla['exchange_rates']['VEF_USD']);
                  if (Math.ceil(Math.log10(vesBitVzla + 1)) >= 9 ) vesBitVzla = parseFloat((vesBitVzla / 100000).toFixed(3)); // Validation if still in VEF
                  arrayVesPrices.push(vesBitVzla);
                  console.log('VES BitVzla ',vesBitVzla);
                  console.log(arrAvg(arrayVesPrices));
                return utils.respondWithResults(res, 200)(arrayVesPrices);
                  })
                  })
                })
              }).catch(()=>{ // Error on DolarToday
                  //Request Yadio
                return rp(requestYadio).then((responseYadio)=>{
                  let vesYadio = parseFloat(responseYadio['USD']['rate'].toFixed(3));
                  arrayVesPrices.push(vesYadio);
                  console.log('VES Yadio ',vesYadio);
                  //Request BasicChange
                return rp(requestBasicChange).then((responseBasicChange)=>{         
                  let vesBasicChange = parseFloat((responseBasicChange['data']['rate_buy'] / responseBasicChange['data']['price_usd']).toFixed(3));
                  arrayVesPrices.push(vesBasicChange);
                  console.log('VES BasicChange ',vesBasicChange);
                  //Request BitVzla
                return rp(requestBitVzla).then((responseBitVzla)=>{         
                  let vesBitVzla = parseFloat(responseBitVzla['exchange_rates']['VEF_USD']);
                  if (Math.ceil(Math.log10(vesBitVzla + 1)) >= 9 ) vesBitVzla = parseFloat((vesBitVzla / 100000).toFixed(3)); // Validation if still in VEF
                  arrayVesPrices.push(vesBitVzla);
                  console.log('VES BitVzla ',vesBitVzla);
                  console.log(arrAvg(arrayVesPrices));
                return utils.respondWithResults(res, 200)(arrayVesPrices);
                  })
                  })
                }).catch(()=>{ // Error on Yadio
                  //Request BasicChange
                  return rp(requestBasicChange).then((responseBasicChange)=>{         
                    let vesBasicChange = parseFloat((responseBasicChange['data']['rate_buy'] / responseBasicChange['data']['price_usd']).toFixed(3));
                    arrayVesPrices.push(vesBasicChange);
                    console.log('VES BasicChange ',vesBasicChange);
                    //Request BitVzla
                  return rp(requestBitVzla).then((responseBitVzla)=>{         
                    let vesBitVzla = parseFloat(responseBitVzla['exchange_rates']['VEF_USD']);
                    if (Math.ceil(Math.log10(vesBitVzla + 1)) >= 9 ) vesBitVzla = parseFloat((vesBitVzla / 100000).toFixed(3)); // Validation if still in VEF
                    arrayVesPrices.push(vesBitVzla);
                    console.log('VES BitVzla ',vesBitVzla);
                    console.log(arrAvg(arrayVesPrices));
                  return utils.respondWithResults(res, 200)(arrayVesPrices);
                    })
                    })
                }).catch(()=>{ // Error on BasicChange
                   //Request BitVzla
                  return rp(requestBitVzla).then((responseBitVzla)=>{         
                    let vesBitVzla = parseFloat(responseBitVzla['exchange_rates']['VEF_USD']);
                    if (Math.ceil(Math.log10(vesBitVzla + 1)) >= 9 ) vesBitVzla = parseFloat((vesBitVzla / 100000).toFixed(3)); // Validation if still in VEF
                    arrayVesPrices.push(vesBitVzla);
                    console.log('VES BitVzla ',vesBitVzla);
                    console.log(arrAvg(arrayVesPrices));
                  return utils.respondWithResults(res, 200)(arrayVesPrices);
                    })
                })
              })



          }).catch((err) => { // Error on CoinMarketCap
              console.log('API call error in CoinMarketCap:', err);
              return rp(requestCoinCap).then((responseCoinCap)=>{
              var usdRateCoinCap = Number(responseCoinCap['data']['priceUsd']).toFixed(3);
              console.log('From CoinCap',usdRateCoinCap)     
              //if success
            }).catch((err) => { // Error on CoinCap
              console.log('API call error in CoinCap:', err);
              return rp(requestCoinGecko).then((responseCoinGecko)=>{
              var usdRateCoinGecko = Number(responseCoinGecko['dash']['usd']).toFixed(3);
              console.log('From CoinGecko',usdRateCoinGecko);
              //if success
            }).catch((err) => { // Error on CoinGecko (All 3 return error)
              return utils.errorHandler('Cant find Dash USD rate'); 
            })
          });            
        });
      }else {
          return utils.errorHandler('Cant find Dash USD rate'); 
      }
}
};


const dolarTodayPromise = (array) => {
    return rp(requestDolarToday).then((responseDolarToday)=>{
    let vesDolarToday = parseFloat(responseDolarToday['USD']['bitcoin_ref'].toFixed(3));
    console.log(typeof vesDolarToday);
    array.push(vesDolarToday);
    }).catch(()=>{
    console.log('Error on DolarToday');  
    });
  }