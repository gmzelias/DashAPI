"use strict";
var request = require('request');
let utils = require("../utils/webUtils");
const rp = require('request-promise');
//let jwt = require('jsonwebtoken');

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
  uri: 'https://api.coingecko.com/api/v3/simple/price?ids=dash&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true',
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

const arrAvg = arrayVesPrices => arrayVesPrices.reduce((a,b) => a + b, 0) / arrayVesPrices.length;

module.exports = {
    //DASH ID FOR CMC 131
    dashUsdBss: (req, res) => {
        var trustedIpOrOrigin = ['::1','localhost:3000','200.109.60.255','https://www.dashhelpme.io','https://dashhelpme.io','http://www.dashhelpme.io','http://dashhelpme.io'];
        let arrayVesPrices = [];
        let vesDashRate;
        let dashRanking;
        let dashMarketCap;
        let dashVolume;
        let capToWP; 
        let volToWP;
        var requestIP = req.headers['x-forwarded-for'];
        var requestOrigin = req.headers['origin']; 
        var requestHost = req.headers['host']; 
       if(trustedIpOrOrigin.indexOf(requestIP) >= 0 || trustedIpOrOrigin.indexOf(requestOrigin) >= 0  || trustedIpOrOrigin.indexOf(requestHost) >= 0) {  //No request allow from unknown IPs
            console.log('Allowed');     
            rp(requestCMC).then((responseCMC) => {
              let usdRateCMC = responseCMC['data']['131']['quote']['USD']['price'].toFixed(3);
              dashRanking = responseCMC['data']['131']['cmc_rank'];
              dashMarketCap = Math.ceil(responseCMC['data']['131']['quote']['USD']['market_cap']);
              dashVolume = Math.ceil(responseCMC['data']['131']['quote']['USD']['volume_24h']);
              console.log('From CoinMarketCap',usdRateCMC);
              capToWP = VolCapRound(dashMarketCap.toString());
              volToWP = VolCapRound(dashVolume.toString());
              console.log(dashRanking);
              console.log(capToWP, 'cap');
              console.log(volToWP, 'vol');
              vesAvgPromise(arrayVesPrices).then((response)=>{
              vesDashRate = (response * usdRateCMC).toFixed(2);
              return utils.respondWithResults(res, 200)({vesDashRate:vesDashRate, usdDashRate:Number(usdRateCMC).toFixed(2),ranking:dashRanking,cap:capToWP,volume:volToWP});
              }).catch((error)=>{
              return utils.errorHandler(res, 500)({error});
              });

              }).catch((err) => { // Error on CoinMarketCap
              console.log(err);
              console.log('API call error in CoinMarketCap');
              return rp(requestCoinCap).then((responseCoinCap)=>{
              var usdRateCoinCap = Number(responseCoinCap['data']['priceUsd']).toFixed(3);
              console.log('From CoinCap',usdRateCoinCap);
              dashRanking = responseCoinCap['data']['rank'];
              dashMarketCap = Math.ceil(responseCoinCap['data']['marketCapUsd']);
              dashVolume = Math.ceil(responseCoinCap['data']['volumeUsd24Hr']);
              capToWP = VolCapRound(dashMarketCap.toString());
              volToWP = VolCapRound(dashVolume.toString());
              vesAvgPromise(arrayVesPrices).then((response)=>{
              vesDashRate = (response * usdRateCoinCap).toFixed(2);
              return utils.respondWithResults(res, 200)({vesDashRate:vesDashRate, usdDashRate:Number(usdRateCMC).toFixed(2),ranking:dashRanking,cap:capToWP,volume:volToWP});
              }).catch((error)=>{
                return utils.errorHandler(res, 500)({error});
              }); 

            }).catch((err) => { // Error on CoinCap
              console.log('API call error in CoinCap', err);
              return rp(requestCoinGecko).then((responseCoinGecko)=>{
              var usdRateCoinGecko = Number(responseCoinGecko['dash']['usd']).toFixed(3);
              console.log('From Coin Gecko',usdRateCoinGecko);
              dashRanking = '14';
              dashMarketCap = Math.ceil(responseCoinGecko['dash']['usd_market_cap']);
              dashVolume = Math.ceil(responseCoinGecko['dash']['usd_24h_vol']);
              capToWP = VolCapRound(dashMarketCap.toString());
              volToWP = VolCapRound(dashVolume.toString());
              vesAvgPromise(arrayVesPrices).then((response)=>{
              vesDashRate = (response * usdRateCoinGecko).toFixed(2);
              return utils.respondWithResults(res, 200)({vesDashRate:vesDashRate, usdDashRate:Number(usdRateCMC).toFixed(2),ranking:dashRanking,cap:capToWP,volume:volToWP});
              }).catch((error)=>{
                return utils.errorHandler(res, 500)({error});
              });
            }).catch((err) => { // Error on CoinGecko (All 3 returned error)
              console.log(err);
              console.log('API call error in CoinGecko');
              return utils.errorHandler(res, 500)({status: "No USD rate found"});
            })
          });            
        });
      }else {
        console.log('Not Allowed');
        return utils.errorHandler(res, 500)({status: "IP out of range"});
      }
},
totalCap: (req, res) => {
  let dashMarketCap;
  let capToWP; 
      rp(requestCMC).then((responseCMC) => {
        dashMarketCap = Math.ceil(responseCMC['data']['131']['quote']['USD']['market_cap']);
        capToWP = VolCapRound(dashMarketCap.toString());
        console.log(capToWP, 'cap');
        return utils.respondWithResults(res, 200)({dashCap:Number(capToWP).toFixed(2)});
        }).catch((err) => { // Error on CoinMarketCap
        console.log(err);
        console.log('API call error in CoinMarketCap');
        return rp(requestCoinCap).then((responseCoinCap)=>{
        dashMarketCap = Math.ceil(responseCoinCap['data']['marketCapUsd']);
        capToWP = VolCapRound(dashMarketCap.toString());
        return utils.respondWithResults(res, 200)({dashCap:Number(capToWP).toFixed(2)});
      }).catch((err) => { // Error on CoinCap
        console.log('API call error in CoinCap', err);
        return rp(requestCoinGecko).then((responseCoinGecko)=>{
        dashMarketCap = Math.ceil(responseCoinGecko['dash']['usd_market_cap']);
        capToWP = VolCapRound(dashMarketCap.toString());
        return utils.respondWithResults(res, 200)({dashCap:Number(capToWP).toFixed(2)});
      }).catch((err) => { // Error on CoinGecko (All 3 returned error)
      //  console.log(err);
        console.log('API call error in CoinGecko');
        return utils.errorHandler(res, 500)({status: "No capitalization found"});
      })
    });            
    });
},

totalVolume: (req, res) => {
      let dashVolume;
      let volToWP;
      rp(requestCMC).then((responseCMC) => {
        dashVolume = Math.ceil(responseCMC['data']['131']['quote']['USD']['volume_24h']);
        volToWP = VolCapRound(dashVolume.toString());
        console.log(volToWP, 'vol');
        return utils.respondWithResults(res, 200)({dashVol:Number(volToWP).toFixed(2)});
        }).catch((err) => { // Error on CoinMarketCap
        console.log(err);
        console.log('API call error in CoinMarketCap');
        return rp(requestCoinCap).then((responseCoinCap)=>{
        dashVolume = Math.ceil(responseCoinCap['data']['volumeUsd24Hr']);
        volToWP = VolCapRound(dashVolume.toString());
        return utils.respondWithResults(res, 200)({dashVol:Number(volToWP).toFixed(2)});
      }).catch((err) => { // Error on CoinCap
        console.log('API call error in CoinCap', err);
        return rp(requestCoinGecko).then((responseCoinGecko)=>{
        dashVolume = Math.ceil(responseCoinGecko['dash']['usd_24h_vol']);
        volToWP = VolCapRound(dashVolume.toString());
        return utils.respondWithResults(res, 200)({dashVol:Number(volToWP).toFixed(2)});
      }).catch((err) => { // Error on CoinGecko (All 3 returned error)
      //  console.log(err);
        console.log('API call error in CoinGecko');
        return utils.errorHandler(res, 500)({status: "No USD rate found"});
      })
    });            
    });
 },

 currentRanking: (req, res) => {
      let dashRanking;
      rp(requestCMC).then((responseCMC) => {
        dashRanking = responseCMC['data']['131']['cmc_rank'];
        return utils.respondWithResults(res, 200)({dashRanking:dashRanking});
        }).catch((err) => { // Error on CoinMarketCap
        console.log(err);
        console.log('API call error in CoinMarketCap');
        return rp(requestCoinCap).then((responseCoinCap)=>{
        dashRanking = responseCoinCap['data']['rank'];
        return utils.respondWithResults(res, 200)({dashRanking:dashRanking});
      }).catch((err) => { // Error on CoinCap
        console.log('API call error in CoinCap', err);
        return rp(requestCoinGecko).then((responseCoinGecko)=>{
        dashRanking = '14';
        return utils.respondWithResults(res, 200)({dashRanking:dashRanking});
      }).catch((err) => { // Error on CoinGecko (All 3 returned error)
        console.log('API call error in CoinGecko');
        return utils.errorHandler(res, 500)({status: "No USD rate found"});
      })
    });            
    });
},
currentRate: (req, res) => {
  let arrayVesPrices = [];
  let vesDashRate;
  if (req.query.currency === 'Bs'){
      rp(requestCMC).then((responseCMC) => {
        let usdRateCMC = responseCMC['data']['131']['quote']['USD']['price'].toFixed(3);
        console.log('From CoinMarketCap',usdRateCMC);
        vesAvgPromise(arrayVesPrices).then((response)=>{
        vesDashRate = (response * usdRateCMC).toFixed(2);
        return utils.respondWithResults(res, 200)({vesDashRate:vesDashRate});
        }).catch((error)=>{
        return utils.errorHandler(res, 500)({error});
        });
        }).catch((err) => { // Error on CoinMarketCap
        console.log(err);
        console.log('API call error in CoinMarketCap');
        return rp(requestCoinCap).then((responseCoinCap)=>{
        var usdRateCoinCap = Number(responseCoinCap['data']['priceUsd']).toFixed(3);
        console.log('From CoinCap',usdRateCoinCap);
        vesAvgPromise(arrayVesPrices).then((response)=>{
        vesDashRate = (response * usdRateCoinCap).toFixed(2);
        return utils.respondWithResults(res, 200)({vesDashRate:vesDashRate});
        }).catch((error)=>{
          return utils.errorHandler(res, 500)({error});
        }); 
      }).catch((err) => { // Error on CoinCap
        console.log('API call error in CoinCap', err);
        return rp(requestCoinGecko).then((responseCoinGecko)=>{
        var usdRateCoinGecko = Number(responseCoinGecko['dash']['usd']).toFixed(3);
        vesAvgPromise(arrayVesPrices).then((response)=>{
        vesDashRate = (response * usdRateCoinGecko).toFixed(2);
        return utils.respondWithResults(res, 200)({vesDashRate:vesDashRate});
        }).catch((error)=>{
          return utils.errorHandler(res, 500)({error});
        });
      }).catch((err) => { // Error on CoinGecko (All 3 returned error)
        console.log(err);
        console.log('API call error in CoinGecko');
        return utils.errorHandler(res, 500)({status: "No Bs rate found"});
      })
    });            
  });
  }  if (req.query.currency === 'USD'){ /* End Bs IF */ 
        rp(requestCMC).then((responseCMC) => {
          let usdRateCMC = responseCMC['data']['131']['quote']['USD']['price'].toFixed(3);
          console.log('From CoinMarketCap',usdRateCMC);
          return utils.respondWithResults(res, 200)({usdDashRate:usdRateCMC});
          }).catch((err) => { // Error on CoinMarketCap
          console.log(err);
          console.log('API call error in CoinMarketCap');
          return rp(requestCoinCap).then((responseCoinCap)=>{
          var usdRateCoinCap = Number(responseCoinCap['data']['priceUsd']).toFixed(3);
          console.log('From CoinCap',usdRateCoinCap); 
          return utils.respondWithResults(res, 200)({usdDashRate:usdRateCoinCap});
        }).catch((err) => { // Error on CoinCap
          console.log('API call error in CoinCap', err);
          return rp(requestCoinGecko).then((responseCoinGecko)=>{
          var usdRateCoinGecko = Number(responseCoinGecko['dash']['usd']).toFixed(3);
          console.log('From CoinGecko',usdRateCoinCap); 
          return utils.respondWithResults(res, 200)({usdDashRate:usdRateCoinGecko});
        }).catch((err) => { // Error on CoinGecko (All 3 returned error)
          console.log(err);
          console.log('API call error in CoinGecko');
          return utils.errorHandler(res, 500)({status: "No USD rate found"});
        })
      });            
    });
  }/* End USD IF */ 
  console.log(req.query.currency);
if (req.query.currency !== 'USD' && req.query.currency !== 'Bs' ) return utils.errorHandler(res, 400)({status: "Bad Request"});
}
};


          /* Round Volume or Capitalization to WP format*/
          const VolCapRound = (volcap) => {
            let capToWP
            if (volcap.length === 10) capToWP = volcap.toString().slice(0,1)+'.'+volcap.toString().slice(1,2);
            if (volcap.length === 9)  capToWP = volcap.toString().slice(0,3);
            return capToWP;
          };
          /* DolarToday API request*/
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
            };
            /* Yadio API request*/ 
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
            };
            /* Basic Change API request*/ 
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
              };
            /* Bit Venezuela API request*/ 
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

          /* Function to calculate Bs prive average*/ 
          const vesAvgPromise = (array) => {
            return new Promise ((resolve, reject) => {
              dolarTodayPromise(array).then((response)=>{
                //Request Yadio
              return yadioPromise(array).then((response)=>{
                  //Request Basic Change
                return basicChangePromise(array).then((response)=>{
                    //Request Bitcoin Venezuela
                  return bitVzlaPromise(array).then((response)=>{
                     console.log(response);
                     let vesAvg = arrAvg(array)
                     resolve (vesAvg);
                  }).catch((error)=>{
                    console.log(response);
                    console.log(error);
                    let vesAvg = arrAvg(array)
                    resolve (vesAvg);
                  })
                }).catch((error)=>{
                  console.log(error);
                  //Request Bitcoin Venezuela
                  return bitVzlaPromise(array).then((response)=>{
                     console.log(response);
                     let vesAvg = arrAvg(array)
                     resolve (vesAvg);
                  }).catch((error)=>{
                    console.log(response);
                    console.log(error);
                    let vesAvg = arrAvg(array)
                    resolve (vesAvg);
                  })
                })
              }).catch((error)=>{ //Yadio Error
                console.log(error);
                //Request Basic Change
                return basicChangePromise(array).then((response)=>{
                  //Request Bitcoin Venezuela
                return bitVzlaPromise(array).then((response)=>{
                   console.log(response);
                   let vesAvg = arrAvg(array)
                   resolve (vesAvg);
                }).catch((error)=>{
                  console.log(error);
                  console.log(response);       
                  let vesAvg = arrAvg(array)
                  resolve (vesAvg);
                })
              }).catch((error)=>{ //Basic Change Error
                console.log(error);
                  //Request Bitcoin Venezuela
                return bitVzlaPromise(array).then((response)=>{
                   console.log(response);
                   let vesAvg = arrAvg(array)
                   resolve (vesAvg);
                }).catch((error)=>{
                  console.log(response);
                  console.log(error);
                  let vesAvg = arrAvg(array)
                  resolve (vesAvg);
                })
              })
              })
            }).catch((error)=>{ //DT Error
              console.log(error);
                  //Request Yadio
              return yadioPromise(array).then((response)=>{
                  //Request Basic Change
                return basicChangePromise(array).then((response)=>{
                    //Request Bitcoin Venezuela
                  return bitVzlaPromise(array).then((response)=>{
                     console.log(response);
                     let vesAvg = arrAvg(array)
                     resolve (vesAvg);
                  }).catch((error)=>{
                    console.log(error);
                    console.log(response);
                    let vesAvg = arrAvg(array)
                    resolve (vesAvg);
                  })
                }).catch((error)=>{
                  console.log(error);
                    //Request Bitcoin Venezuela
                  return bitVzlaPromise(array).then((response)=>{
                     console.log(response);
                     let vesAvg = arrAvg(array)
                     resolve (vesAvg);
                  }).catch((error)=>{
                    console.log(error);
                    console.log(response);
                    let vesAvg = arrAvg(array)
                    resolve (vesAvg);
                  })
                })
              }).catch((error)=>{
                console.log(error);
                      //Request Basic Change
                return basicChangePromise(array).then((response)=>{
                    //Request Bitcoin Venezuela
                  return bitVzlaPromise(array).then((response)=>{
                     console.log(response);
                     let vesAvg = arrAvg(array)
                     resolve (vesAvg);
                  }).catch((error)=>{
                    console.log(error);
                    console.log(response);                    
                    let vesAvg = arrAvg(array)
                    resolve (vesAvg);
                  })
                }).catch((error)=>{
                  console.log(error);
                    //Request Bitcoin Venezuela
                  return bitVzlaPromise(array).then((response)=>{
                     console.log(response);
                     let vesAvg = arrAvg(array)
                     resolve (vesAvg);
                  }).catch((error)=>{
                    console.log(error);
                    reject('No VES data'); 
                  })
                })
              })
            });
            })
            };


