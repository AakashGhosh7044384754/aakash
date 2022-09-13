const express = require("express");
const bodyParser = require("body-parser");
const route = require("./router/route.js");
const monogoose = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

monogoose
  .connect(
    "mongodb+srv://agDuke:aakash1234@cluster0.oyazcaq.mongodb.net/BloggingSite_mini?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )

  .then(() => console.log("MongoDB is Connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, () => {
  console.log("express running on port" + (process.env.PORT || 3000));
});
