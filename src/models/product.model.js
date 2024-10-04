"use strict";

const { model, Schema, Types } = require("mongoose");
const slugify = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
  {
    product_name: { type: String, required: true },
    product_thumb: String,
    product_description: String,
    product_slug: String,
    product_price: { type: Number, required: true },
    product_quantity: Number,
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: { type: Types.ObjectId, ref: "Shop" },
    product_attributes: { type: Schema.Types.Mixed, required: true },

    // more
    product_ratingAverage: {
      type: Types.Decimal128,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: {},
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

// create index for search
productSchema.index({ product_name: "text", product_description: "text" });

// Document middleware: runs before .save() and .create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

// define the product type = clothing
const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "Clothes",
    timestamps: true,
  }
);

// define the product type = electronics
const electronicSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "Electronics",
    timestamps: true,
  }
);

// define the product type = furniture
const furnitureSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "Furnitures",
    timestamps: true,
  }
);

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronics", electronicSchema),
  furniture: model("Furniture", furnitureSchema),
};
