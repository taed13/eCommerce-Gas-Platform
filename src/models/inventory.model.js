"use strict";

const {
    model,
    Schema,
    Types
} = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

var inventorySchema = new Schema({
    inven_product_id: {
        type: Types.ObjectId,
        ref: "Product",
    },
    inven_location: {
        type: String,
        default: "HCM",
    },
    inven_stock: {
        type: Number,
        required: true,
    },
    inven_shopId: {
        type: Types.ObjectId,
        ref: "Shop",
    },
    inven_reservation: {
        type: Array,
        default: [],
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

//Export the model
module.exports = {
    inventory: model(DOCUMENT_NAME, inventorySchema),
};