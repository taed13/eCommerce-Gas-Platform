"use strict";

const express = require("express");

const router = express.Router();

router.get("/", function (req, res) {
  return res.status(200).json({
    message: "Welcome to my API",
  });
});

router.use("/v1/api", require("./access"));

module.exports = router;
