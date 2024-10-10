"use strict";

const crypto = require("crypto");

const apikeyModel = require("../models/apikey.model");

const findById = async (key) => {
    // const newKey = await apikeyModel.create({
    //   key: crypto.randomBytes(16).toString("hex"),
    //   permissions: ["0000"],
    // });
    // console.log("NEW KEY:: ", newKey);
    const objKey = await apikeyModel.findOne({
        key,
        status: true
    }).lean();
    return objKey;
};

module.exports = {
    findById,
};