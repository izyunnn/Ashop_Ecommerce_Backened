const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: String },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer,
    contentType: String
  }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
