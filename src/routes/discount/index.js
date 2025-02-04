"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const DiscountController = require("../../controllers/discount.controller");
const router = express.Router();

// get amount a discount
router.post("/amount", asyncHandler(DiscountController.getDiscountAmount));
router.get(
  "/list_product_code",
  asyncHandler(DiscountController.getAllDiscountCodesWithProducts)
);

// authentication
router.use(authenticationV2);

router.get("", asyncHandler(DiscountController.getAllDiscountCodes));

router.post("", asyncHandler(DiscountController.createDiscountCode));
// router.post(
//   "",
//   asyncHandler(() => {
//     console.log("HERE");
//   })
// );

module.exports = router;
