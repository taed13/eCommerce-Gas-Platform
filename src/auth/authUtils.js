"use strict";

const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // access token
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    // refresh token
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decoded) => {
      if (err) {
        console.log(`error verify::`, err);
      } else {
        console.log(`decoded verify::`, decoded);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(`error createTokenPair::`, error);
  }
};

module.exports = { createTokenPair };
