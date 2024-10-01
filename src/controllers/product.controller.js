"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
  createProduct = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Product created successfully",
    //   metadata: await ProductService.createProduct(req.body.product_type, {
    //     ...req.body,
    //     product_shop: req.keyStore.user,
    //   }),
    // }).send(res);

    new SuccessResponse({
      message: "Product created successfully",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Product published successfully",
      metadata: await ProductServiceV2.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unpublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Product unpublished successfully",
      metadata: await ProductServiceV2.unpublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // QUERY
  /**
   * @desc Get all drafts for shop
   * @param { Number } limit
   * @param { Number } skip
   * @return { JSON }
   */
  getAllDratfsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "All drafts for shop",
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  // END QUERY

  // QUERY FOR PUBLISH
  /**
   * @desc Get all publish for shop
   * @param { Number } limit
   * @param { Number } skip
   * @return { JSON }
   */
  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "All publish for shop",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "List search product",
      metadata: await ProductServiceV2.getListSearchProduct(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "All products",
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Product detail",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
