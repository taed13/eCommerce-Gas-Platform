"use strict";

const express = require("express");

const accessControler = require("../../controllers/access.controler");
const router = express.Router();

// signUp
router.post("/shop/signup", accessControler.signUp);

module.exports = router;
