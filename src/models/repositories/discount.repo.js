"use strict";
const discount = require("../../models/discount.model");
const { unSelectData } = require("../../utils");

const findAllDiscountCodesUnSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  unSelect,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unSelectData(unSelect))
    .lean();

  return discounts;
};

const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  select,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelection(select))
    .lean();

  return discounts;
};

module.exports = {
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect,
};
