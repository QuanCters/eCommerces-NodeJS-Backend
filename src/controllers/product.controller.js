const ProductFactory = require("../services/product.service");
const {
  ProductFactory: ProductFactoryOptimize,
} = require("../services/product.service.optimize");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Create new product success",
    //   metadata: await ProductFactory.createProduct(req.body.product_type, {
    //     ...req.body,
    //     product_shop: req.user.userId,
    //   }),
    // }).send(res);
    new SuccessResponse({
      message: "Create new product success",
      metadata: await ProductFactoryOptimize.createProduct(
        req.body.product_type,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };
}

module.exports = new ProductController();
