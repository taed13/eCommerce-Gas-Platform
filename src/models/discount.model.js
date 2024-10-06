"use strict";

// lưu trữ token từ ngày này tháng nọ
const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

var discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      required: true,
      unique: true,
    },
    discount_description: {
      type: String,
      required: true,
    },
    discount_type: {
      type: String,
      required: true,
      enum: ["fixed_amount", "percentage"],
      default: "fixed_amount",
    },
    discount_value: {
      type: Number,
      required: true,
    },
    discount_code: {
      type: String,
      required: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    // so luong discount duoc ap dung toi da
    discount_max_uses: {
      type: Number,
      required: true,
    },
    // so discount da su dung
    discount_uses_count: {
      type: Number,
      required: true,
    },
    discount_users_used: {
      type: Array,
      default: [],
    },
    // so luong discount duoc ap dung toi da cho 1 user
    discount_max_uses_per_user: {
      type: Number,
      required: true,
    },
    discount_min_order_value: {
      type: Number,
      required: true,
    },
    discount_shopId: {
      type: Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    // danh sach product duoc ap dung discount
    discount_product_ids: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
