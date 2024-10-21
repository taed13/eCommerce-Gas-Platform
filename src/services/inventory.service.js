'use strict';

const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");
const {
    BadRequestError,
    NotFoundError
} = require("../core/error.response");

class InventoryService {
    static async addStockToInventory({ stock, productId, shopId, location = "32B Lê Văn Lương" }) {
        const product = await getProductById(productId);
        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const query = {
            inven_shopId: shopId,
            inven_productId: productId
        }, updateSet = {
            $inc: {
                inven_stock: stock
            },
            $set: {
                inven_location: location
            }
        }, options = {
            new: true,
            upsert: true
        };

        return await inventory.findOneAndUpdate(query, updateSet, options);
    }
}

module.exports = InventoryService;