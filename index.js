const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const productRoute = require("./routes").product;
const passport = require("passport");
require("./config/passport")(passport);

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

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", authRoute);
app.use(
  "/api/products",
  passport.authenticate("jwt", { session: false }),
  productRoute
);

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
