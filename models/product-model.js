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
  productImage: {
    data: Buffer,
    contentType: String
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  customer: {
    type: [String],
    default: [],
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
