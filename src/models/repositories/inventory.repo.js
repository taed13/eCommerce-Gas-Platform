"use strict";
const {
    inventory
} = require("../../models/inventory.model");

const insertInventory = async ({
    productId,
    shopId,
    stock,
    location = "HCM",
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId,
    });
};

module.exports = {
    insertInventory,
};