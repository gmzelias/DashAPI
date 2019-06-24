"use strict";
var request = require('request');
let utils = require("../utils/webUtils");
const rp = require('request-promise');
//let jwt = require('jsonwebtoken');

module.exports = {
    //DASH ID FOR CMC 131
    dashUsdBss: (req, res) => {
        var trustedIps = ['::1','200.109.60.255'];
        var requestIP = req.headers['x-real-ip'] || req.connection.remoteAddress;
        var reqheader = req.headers;
       /* console.log(req.ip);
        console.log(req.connection.remoteAddress);*/
      //  if(trustedIps.indexOf(requestIP) >= 0) {  //No request allow from unknown IPs
            console.log('IP Allowed');
            
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
            let vesDashRate;

            rp(requestCMC).then((responseCMC) => {
              let usdRateCMC = responseCMC['data']['131']['quote']['USD']['price'].toFixed(3);
              console.log('From CoinMarketCap',usdRateCMC);
              vesAvgPromise(arrayVesPrices).then((response)=>{
              vesDashRate = (response * usdRateCMC).toFixed(2);
              return utils.respondWithResults(res, 200)({header:reqheader,vesDashRate:vesDashRate, usdDashRate:Number(usdRateCMC).toFixed(2)});
              }).catch((error)=>{
              return utils.errorHandler(res, 500)({error});
              });

              }).catch((err) => { // Error on CoinMarketCap
              console.log('API call error in CoinMarketCap');
              return rp(requestCoinCap).then((responseCoinCap)=>{
              var usdRateCoinCap = Number(responseCoinCap['data']['priceUsd']).toFixed(3);
              console.log('From CoinCap',usdRateCoinCap);
              vesAvgPromise(arrayVesPrices).then((response)=>{
              vesDashRate = (response * usdRateCoinCap).toFixed(2);
              return utils.respondWithResults(res, 200)({header:reqheader,vesDashRate:vesDashRate, usdDashRate:Number(usdRateCoinCap).toFixed(2)});
              }).catch((error)=>{
                return utils.errorHandler(res, 500)({error});
              }); 

            }).catch((err) => { // Error on CoinCap
              console.log('API call error in CoinCap');
              return rp(requestCoinGecko).then((responseCoinGecko)=>{
              var usdRateCoinGecko = Number(responseCoinGecko['dash']['usd']).toFixed(3);
              console.log('From Coin Gecko',usdRateCoinGecko);
              vesAvgPromise(arrayVesPrices).then((response)=>{
              vesDashRate = (response * usdRateCoinGecko).toFixed(2);
              return utils.respondWithResults(res, 200)({header:reqheader,vesDashRate:vesDashRate, usdDashRate:Number(usdRateCoinGecko).toFixed(2)});
              }).catch((error)=>{
                return utils.errorHandler(res, 500)({error});
              });
            }).catch((err) => { // Error on CoinGecko (All 3 returned error)
              console.log('API call error in CoinGecko');
              return utils.errorHandler(res, 500)({status: "No USD rate found"});
            })
          });            
        });

          const dolarTodayPromise = (array) => {
            return new Promise ((resolve, reject) => {
              rp(requestDolarToday).then((responseDolarToday)=>{
                let vesDolarToday = parseFloat(responseDolarToday['USD']['bitcoin_ref'].toFixed(3));
                array.push(vesDolarToday);
                resolve(array);
                }).catch(()=>{
                reject('Error on DolarToday');  
                });
            })
            } 
          const yadioPromise = (array) => {
            return new Promise ((resolve, reject) => {
              rp(requestYadio).then((responseYadio)=>{
                let vesYadio = parseFloat(responseYadio['USD']['rate'].toFixed(3));
                array.push(vesYadio);
                resolve(array);
                }).catch(()=>{
                reject('Error on Yadio');  
                });
            })
            }
            const basicChangePromise = (array) => {
              return new Promise ((resolve, reject) => {
                rp(requestBasicChange).then((responseBasicChange)=>{         
                  let vesBasicChange = parseFloat((responseBasicChange['data']['rate_buy'] / responseBasicChange['data']['price_usd']).toFixed(3));
                  array.push(vesBasicChange);
                  resolve(array);
                  }).catch(()=>{
                  reject('Error on Basic Change');  
                  });
              })
              }
            const bitVzlaPromise = (array) => {
              return new Promise ((resolve, reject) => {
                rp(requestBitVzla).then((responseBitVzla)=>{         
                  let vesBitVzla = parseFloat(responseBitVzla['exchange_rates']['VEF_USD']);
                  if (Math.ceil(Math.log10(vesBitVzla + 1)) >= 9 ) vesBitVzla = parseFloat((vesBitVzla / 100000).toFixed(3)); // Validation if still in VEF
                  else vesBitVzla = parseFloat(vesBitVzla.toFixed(3));
                  array.push(vesBitVzla);
                  resolve(array);
                  }).catch(()=>{
                  reject('Error on Bit Vzla');  
                  });
              })
              }

              const vesAvgPromise = (array) => {
                return new Promise ((resolve, reject) => {
                  dolarTodayPromise(arrayVesPrices).then((response)=>{
                    //Request Yadio
                  return yadioPromise(arrayVesPrices).then((response)=>{
                      //Request Basic Change
                    return basicChangePromise(arrayVesPrices).then((response)=>{
                        //Request Bitcoin Venezuela
                      return bitVzlaPromise(arrayVesPrices).then((response)=>{
                         console.log(response);
                         let vesAvg = arrAvg(arrayVesPrices)
                         resolve (vesAvg);
                      }).catch((error)=>{
                        console.log(response);
                        console.log(error);
                        let vesAvg = arrAvg(arrayVesPrices)
                        resolve (vesAvg);
                      })
                    }).catch((error)=>{
                      console.log(error);
                      //Request Bitcoin Venezuela
                      return bitVzlaPromise(arrayVesPrices).then((response)=>{
                         console.log(response);
                         let vesAvg = arrAvg(arrayVesPrices)
                         resolve (vesAvg);
                      }).catch((error)=>{
                        console.log(response);
                        console.log(error);
                        let vesAvg = arrAvg(arrayVesPrices)
                        resolve (vesAvg);
                      })
                    })
                  }).catch((error)=>{ //Yadio Error
                    console.log(error);
                    //Request Basic Change
                    return basicChangePromise(arrayVesPrices).then((response)=>{
                      //Request Bitcoin Venezuela
                    return bitVzlaPromise(arrayVesPrices).then((response)=>{
                       console.log(response);
                       let vesAvg = arrAvg(arrayVesPrices)
                       resolve (vesAvg);
                    }).catch((error)=>{
                      console.log(error);
                      console.log(response);       
                      let vesAvg = arrAvg(arrayVesPrices)
                      resolve (vesAvg);
                    })
                  }).catch((error)=>{ //Basic Change Error
                    console.log(error);
                      //Request Bitcoin Venezuela
                    return bitVzlaPromise(arrayVesPrices).then((response)=>{
                       console.log(response);
                       let vesAvg = arrAvg(arrayVesPrices)
                       resolve (vesAvg);
                    }).catch((error)=>{
                      console.log(response);
                      console.log(error);
                      let vesAvg = arrAvg(arrayVesPrices)
                      resolve (vesAvg);
                    })
                  })
                  })
                }).catch((error)=>{ //DT Error
                  console.log(error);
                      //Request Yadio
                  return yadioPromise(arrayVesPrices).then((response)=>{
                      //Request Basic Change
                    return basicChangePromise(arrayVesPrices).then((response)=>{
                        //Request Bitcoin Venezuela
                      return bitVzlaPromise(arrayVesPrices).then((response)=>{
                         console.log(response);
                         let vesAvg = arrAvg(arrayVesPrices)
                         resolve (vesAvg);
                      }).catch((error)=>{
                        console.log(error);
                        console.log(response);
                        let vesAvg = arrAvg(arrayVesPrices)
                        resolve (vesAvg);
                      })
                    }).catch((error)=>{
                      console.log(error);
                        //Request Bitcoin Venezuela
                      return bitVzlaPromise(arrayVesPrices).then((response)=>{
                         console.log(response);
                         let vesAvg = arrAvg(arrayVesPrices)
                         resolve (vesAvg);
                      }).catch((error)=>{
                        console.log(error);
                        console.log(response);
                        let vesAvg = arrAvg(arrayVesPrices)
                        resolve (vesAvg);
                      })
                    })
                  }).catch((error)=>{
                    console.log(error);
                          //Request Basic Change
                    return basicChangePromise(arrayVesPrices).then((response)=>{
                        //Request Bitcoin Venezuela
                      return bitVzlaPromise(arrayVesPrices).then((response)=>{
                         console.log(response);
                         let vesAvg = arrAvg(arrayVesPrices)
                         resolve (vesAvg);
                      }).catch((error)=>{
                        console.log(error);
                        console.log(response);                    
                        let vesAvg = arrAvg(arrayVesPrices)
                        resolve (vesAvg);
                      })
                    }).catch((error)=>{
                      console.log(error);
                        //Request Bitcoin Venezuela
                      return bitVzlaPromise(arrayVesPrices).then((response)=>{
                         console.log(response);
                         let vesAvg = arrAvg(arrayVesPrices)
                         resolve (vesAvg);
                      }).catch((error)=>{
                        console.log(error);
                        reject('No VES data'); 
                      })
                    })
                  })
                });
                })
                }
    /*  }else {
        return utils.errorHandler(res, 500)({status: "IP out of range"});
      }*/
}
};


