"use strict";

const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { BadRequestError, ForbiddenError } = require("../core/error.response");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unpublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObject } = require("../utils");

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

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.producRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid Product type: ${type}`);

    return new productClass(payload).createProduct(productId);
  }

  // PUT Product
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }
  // END PUT Product

  // PUT Product Unpublish
  static async unpublishProductByShop({ product_shop, product_id }) {
    return await unpublishProductByShop({ product_shop, product_id });
  }

  // query
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };

    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };

    return await findAllPublishForShop({ query, limit, skip });
  }

  static async getListSearchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb"],
    });
  }

  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ["__v"] });
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

  //update product
  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({ productId, bodyUpdate, model: product });
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

  async updateProduct(productId) {
    /* remove attributes that are not allowed to be updated */
    // 1. remove attributes that are not allowed to be updated
    // 2. check if the product exists

    const objectParams = removeUndefinedObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObject(objectParams.product_attributes),
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObject(objectParams)
    );
    if (!updateProduct) {
      throw new BadRequestError("Error: Failed to update product");
    }

    return updateProduct;
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
