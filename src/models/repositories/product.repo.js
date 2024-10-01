"use strict";

const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");

const { Types } = require("mongoose");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const shop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!shop) {
    throw new ForbiddenError("Error: Product not found");
  }

  shop.isDraft = false;
  shop.isPublished = true;

  const { modifiedCount } = await shop.updateOne(shop);
  if (!modifiedCount) {
    throw new ForbiddenError("Error: Failed to publish product");
  }

  return modifiedCount;
};

const unpublishProductByShop = async ({ product_shop, product_id }) => {
  const shop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!shop) {
    throw new ForbiddenError("Error: Product not found");
  }

  shop.isDraft = true;
  shop.isPublished = false;

  const { modifiedCount } = await shop.updateOne(shop);
  if (!modifiedCount) {
    throw new ForbiddenError("Error: Failed to unpublish product");
  }

  return modifiedCount;
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      {
        score: { $meta: "textScore" },
      }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return results;
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unpublishProductByShop,
  searchProductByUser,
};
