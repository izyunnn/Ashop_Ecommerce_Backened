const router = require("express").Router();
const Product = require("../models").productModel;
const productValidation = require("../validation").productValidation;

router.use((req, res, next) => {
  console.log("A request is coming into api...");
  next();
});

router.get("/", (req, res) => {
  Product.find({})
    .populate("merchant", ["username", "email"])
    .then((product) => {
      res.send(product);
    })
    .catch(() => {
      res.status(500).send("Error!! Cannot get product!!");
    });
});

router.get("/:_id", (req, res) => {
  const { _id } = req.params;
  Product.findOne({ _id })
    .populate("merchant", ["email"])
    .then((product) => {
      res.send(product);
    })
    .catch((e) => {
      res.send(e);
    });
});

router.post("/", async (req, res) => {
  console.log("A request is coming into products...");
  // validate the inputs before making a new product
  const { error } = productValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { title, description, price,productImage, category } = req.body;
  if (req.user.isCustomer()) {
    return res.status(400).send("Only merchant can post a new product.");
  }

  const newProduct = new Product({
    title,
    description,
    price,
    productImage,
    category,
    merchant: req.user._id,
  });

  try {
    await newProduct.save();
    res.status(200).send("New product has been saved.");
  } catch (err) {
    res.status(400).send("Cannot save product.");
  }
});

router.patch("/:_id", async (req, res) => {
  // validate the inputs before making a new product
  const { error } = productValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { _id } = req.params;
  const product = await Product.findOne({ _id });
  if (!product) {
    res.status(404);
    return res.json({
      success: false,
      message: "product not found.",
    });
  }

  if (product.merchant.equals(req.user._id) || req.user.isAdmin()) {
    Product.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send("product updated.");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message:
        "Only the merchant of this product or web admin can edit this product.",
    });
  }
});

router.delete("/:_id", async (req, res) => {
  const { _id } = req.params;
  const product = await Product.findOne({ _id });
  if (!product) {
    res.status(404);
    return res.json({
      success: false,
      message: "product not found.",
    });
  }

  if (product.merchant.equals(req.user._id) || req.user.isAdmin()) {
    Product.deleteOne({ _id })
      .then(() => {
        res.send("product deleted.");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message:
        "Only the merchant of this product or web admin can delete this product.",
    });
  }
});

module.exports = router;
