"use strict";

// lưu trữ token từ ngày này tháng nọ
const {
    model,
    Schema,
    Types
} = require("mongoose");

const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

var apiKeySchema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    permissions: {
        type: [String],
        required: true,
        enum: ["0000", "1111", "2222"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "30d",
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeySchema);