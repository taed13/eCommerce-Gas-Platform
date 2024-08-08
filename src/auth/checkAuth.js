"use strict";

const { HEADER } = require("../configs/constants");
const { findById } = require("../services/apikey.service");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error - API key",
      });
    }

    // check objKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error - Object key",
      });
    }
    req.objKey = objKey;
    return next();
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: "Forbidden Error - Permission",
      });
    }

    console.log("permissions::", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);

    if (!validPermission) {
      return res.status(403).json({
        message: "Forbidden Error - Permission",
      });
    }

    return next();
  };
};

module.exports = { apiKey, permission };
