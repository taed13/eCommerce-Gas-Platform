"use strict";

const express = require("express");

const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication, authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProduct)
);
// authentication routes
router.use(authenticationV2);

// create product
router.post("", asyncHandler(productController.createProduct));
router.post(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandler(productController.unpublishProductByShop)
);

// QUERY
router.get("/drafts/all", asyncHandler(productController.getAllDratfsForShop));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
