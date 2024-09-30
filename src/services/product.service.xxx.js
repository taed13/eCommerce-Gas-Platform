"use strict";

const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { BadRequestError, ForbiddenError } = require("../core/error.response");

// define Factory class to create product
class ProductFactory {
  static producRegistry = {}; // key-class

  static registerProductType(type, classRef) {
    ProductFactory.producRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.producRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid Product type: ${type}`);

    return new productClass(payload).createProduct();
  }
}

// define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  //create new product
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

// define sub-class for different product types Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });

    if (!newClothing) {
      throw new BadRequestError("Error: Failed to create clothing");
    }

    const newProduct = await super.createProduct();
    if (!newProduct) {
      throw new BadRequestError("Error: Failed to create product");
    }

    return newProduct;
  }
}

// define sub-class for different product types Electronics
class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) {
      throw new BadRequestError("Error: Failed to create electronic");
    }

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError("Error: Failed to create product");
    }

    return newProduct;
  }
}

// define sub-class for different product types Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) {
      throw new BadRequestError("Error: Failed to create furniture");
    }

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestError("Error: Failed to create product");
    }

    return newProduct;
  }
}

// register product types
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
