"use strict";

const express = require("express");

const accessControler = require("../../controllers/access.controler");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// signUp
router.post("/shop/signup", asyncHandler(accessControler.signUp));

// login
router.post("/shop/login", asyncHandler(accessControler.login));

// authentication
router.use(authentication);

// logout
router.post("/shop/logout", asyncHandler(accessControler.logout));
router.post(
  "/shop/handlerRefreshToken",
  asyncHandler(accessControler.handlerRefreshToken)
);

module.exports = router;
