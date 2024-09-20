"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongoDB } = require("../utils");
const {
  findAllDiscountCodeUnselect,
  findAllDiscountCodeSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");

/* 
    Discount Services
    1 - Generate Discount Code [Shop | Admin]
    2 - Get Discount Amount [User]
    3 - Get All Discount Codes [User | Shop]
    4 - Verify Discount Code [User]
    5 - Delete Discount Code [Admin | Shop]
    6 - Cancel Discount Code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applied_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
    } = payload;

    // kiem tra
    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount code has expired!");
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }

    // create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongoDB(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount existed");
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_value: max_value,
      discount_max_use_per_users: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applied_to,
      discount_product_ids: applied_to === "all" ? [] : product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode() {
    //....
  }

  /* 
    Get all discount codes available with products
  */

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongoDB(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount not exists!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;

    if (discount_applies_to === "all") {
      // get all product
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongoDB(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    } else if (discount_applies_to === "specific") {
      // get the products ids
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  /* 
    Get all discount codes of shop
  */

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodeUnselect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongoDB(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discount,
    });

    return discounts;
  }

  /*
    Apply discount code
    products = [
      {
        productId,
        shopId,
        quantity,
        name,
        price
      }, ...
    ]
  */

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongoDB(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount Does not Exist");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundError("Discount Expired");
    }

    if (!discount_max_uses) {
      throw new NotFoundError("Discount Are Out");
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("Discount Code Has Expired");
    }

    // check if code have minimum value for order
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount Require A Minium Order Value of ${discount_min_order_value}`
        );
      }

      if (discount_max_use_per_users > 0) {
        const userUserDiscount = discount_users_used.find(
          (user) => user.userId === userId
        );
        if (userUserDiscount) {
          // ...
        }
      }

      // Check if discount is fix amount
      const amount =
        discount_type === "fixed_amount"
          ? discount_value
          : totalOrder * (discount_value / 100);

      return {
        totalOrder,
        discount: amount,
        totalPrice: totalOrder - amount,
      };
    }
  }

  static async deleteDiscount(codeId, shopId) {
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongoDB(shopId),
    });

    return deleted;
  }

  /*
    Cancel Discount by User
  */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongoDB(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundError(`Discount Doesn't Exist`);
    }

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
