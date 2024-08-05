"use strict";
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const shopModel = require("../models/shop.model");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const KeyTokenService = require("./keyToken.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // Check if the email is already in use
      const hodelShop = await shopModel.findOne({ email }).lean();

      if (hodelShop) {
        return {
          code: "40001",
          message: "Shop already in use",
          status: "error",
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        // create private key, public key
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        console.log({ privateKey, publicKey }); // save collection KeyStore

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });

        if (!keyStore) {
          return {
            code: "50002",
            message: "Error create key store",
          };
        }

        // created token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey
        );
        console.log(`Created token pair::`, tokens);

        return {
          code: "20001",
          metadata: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }

      return {
        code: "20001",
        metadata: null,
      };
    } catch (error) {
      return {
        code: "50001",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
