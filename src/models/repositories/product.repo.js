"use strict";

const mongoose = require("mongoose"); // Add this line
const { getSelectData, unGetSelectData } = require("../../utils/index");
const { product } = require("../../models/product.model");

const findProductsForShop = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findAllDraftsForShop = ({ query, limit, skip }) =>
  findProductsForShop({ query, limit, skip });

const findAllPublishedForShop = ({ query, limit, skip }) =>
  findProductsForShop({ query, limit, skip });

const searchProducts = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  return await product
    .find(
      {
        $text: { $search: regexSearch },
        isDraft: false,
        isPublished: true,
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: mongoose.Types.ObjectId.createFromHexString(product_shop),
    _id: mongoose.Types.ObjectId.createFromHexString(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublished = true;

  const { modifiedCount } = await foundShop.save();

  return modifiedCount;
};

const unpublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: mongoose.Types.ObjectId.createFromHexString(product_shop),
    _id: mongoose.Types.ObjectId.createFromHexString(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublished = false;

  const { modifiedCount } = await foundShop.save();

  return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const selectData = getSelectData(select);
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(selectData)
    .lean();

  return products;
};

const findProduct = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unGetSelectData(unSelect));
};

const updateProductById = async ({
  product_id,
  payload,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(product_id, payload, {
    new: isNew,
  });
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
  unpublishProductByShop,
  searchProducts,
  findAllProducts,
  findProduct,
  updateProductById,
};
