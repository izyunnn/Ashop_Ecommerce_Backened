const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
const dotenv = require("dotenv");
dotenv.config();

const authRoute = require("./routes").auth;
const productRoute = require("./routes").product;
const passport = require("passport");
require("./config/passport")(passport);

const uploadImage = require("./models").ImageModel;


// connect to DB
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect to Mongo Altas");
  })
  .catch((e) => {
    console.log(e);
  });

const corsOptions = {
  origin: [
    'http://localhost:3030',
    'http://localhost:8080',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};
  
  app.use(cors(corsOptions));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", authRoute);
app.use("/api/products", productRoute);

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
