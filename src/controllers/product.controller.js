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

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update Product Success",
      metadata: await ProductFactoryOptimize.updateProduct(
        req.body.product_type,
        req.params.product_id,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product success",
      metadata: await ProductFactoryOptimize.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish product success",
      metadata: await ProductFactoryOptimize.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // QUERY
  /**
   * @desc Get all Drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "GET list draft success!",
      metadata: await ProductFactoryOptimize.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  /**
   * @desc Get all published for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return { JSON }
   */
  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "GET list published success!",
      metadata: await ProductFactoryOptimize.findAllPublishedForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search product success!",
      metadata: await ProductFactoryOptimize.searchProducts(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all products success!",
      metadata: await ProductFactoryOptimize.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get products success!",
      metadata: await ProductFactoryOptimize.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
  // END QUERY
}

module.exports = new ProductController();
