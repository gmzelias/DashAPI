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

//DashWebApp
router.post("/logUser", controllerDashText.login);
router.post("/signInUser", controllerDashText.signIn);
router.post("/validateToken", controllerDashText.validateToken);
router.post("/tableData", controllerDashText.tableData);

module.exports = router;

