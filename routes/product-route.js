const router = require("express").Router();
const Product = require("../models").productModel;
const productValidation = require("../validation").productValidation;
const multer = require("multer");
const path = require("path");
const fs = require("fs");

router.use((req, res, next) => {
  console.log("A request is coming into api...");
  next();
});

//store image
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // :::::::::::::::Create diretories:::::::::::::::::::
    fs.mkdir('./images/',(err)=>{
       cb(null, './images/');
    });
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

// filter file
const fileFilter = (req , file, cb) =>{
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  }
  cb(null, false)
}
const upload = multer({ storage: storage, fileFilter: fileFilter });


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

// router.get("/api/getImage", (req, res) => {
//   ImageModel.find({}, (err, images) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("An error occurred", err);
//     } else {
//       res.render("index", { images: images });
//     }
//   });
// });

router.post("/", upload.single("image"), async (req, res) => {
  console.log("A request is coming into products...");
  // validate the inputs before making a new product
  const { error } = productValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { title, description, price, category, image } = req.body;
  const newProduct = new Product({
    title,
    description,
    price,
    category,
    image: req.file.path
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
