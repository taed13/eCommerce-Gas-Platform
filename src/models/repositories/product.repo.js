"use strict";

const { getSelectData, unSelectData } = require("../../utils");
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

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findProduct = async ({ product_id, unSelect }) => {
  return await product
    .findOne({ _id: new Types.ObjectId(product_id) })
    .select(unSelectData(unSelect));
};

const updateProductById = async ({
  product_id,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  const product = await model.findOne({
    _id: new Types.ObjectId(product_id),
  });

  if (!product) {
    throw new ForbiddenError("Error: Product not found");
  }

  return await model.findByIdAndUpdate(product_id, bodyUpdate, {
    new: isNew,
  });
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unpublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
};
