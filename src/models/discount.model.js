"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: "fixed_amount" }, // percentage
    discount_value: { type: Number, required: true },
    discount_code: { type: String, required: true }, // mã discount
    discount_start_date: { type: Date, required: true }, // ngày bắt đầu
    discount_end_date: { type: Date, required: true }, // ngày kết thúc
    discount_max_uses: { type: Number, required: true }, // số lượng discount tối đa
    discount_uses_count: { type: Number, required: true }, // số discount đã sử dụng
    discount_users_used: { type: Array, default: [] }, // ai đã sử dụng
    discount_max_use_per_users: { type: Number, required: true }, // số lượng sử dụng tối đa cho 1 user
    discount_min_order_value: { type: Number, required: true },
    discount_shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    discount_is_active: { type: Boolean, default: true },
    discount_max_value: { type: Number, required: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all, specific"],
    },
    discount_product_ids: { type: Array, default: [] }, // số sản phẩm được áp dụng
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);
