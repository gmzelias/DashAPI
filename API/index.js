"use strict";

let express = require('express');
let controller = require('./API.controller');
let controllerDashText = require('./API.controllerDashText');

let router = express.Router();
router.get("/rates", controller.dashUsdBss);
router.get("/dashCap", controller.totalCap);
router.get("/dashVol", controller.totalVolume);
router.get("/dashRanking", controller.currentRanking);
router.get("/dashRate", controller.currentRate);

//DashText
router.get("/logUser", controllerDashText.login);

module.exports = router;

