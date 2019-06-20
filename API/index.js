"use strict";

let express = require('express');
let controller = require('./API.controller');

let router = express.Router();
router.get("/rates", controller.dashUsdBss);

module.exports = router;

