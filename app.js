const express = require("express"); // creating framework express
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //cookies database noSQL
const path = require("path");

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

mongoose
  .connect(
    "mongodb+srv://RinaL2021:Rina2022@cluster0.chx2x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB !"))
  .catch(() => console.log("Can not connected to MongoDB !"));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//app.get("/api/sauces", function (req, res) {
// res.send("hello world");
//});

//app.get("/api/sauces/:id", function (req, res) {
// res.send("hello from Example  2!!!");
//});

//app use to dsitribute middleware
app.use(bodyParser.json());

app.use("/sauces", sauceRoutes);
app.use("/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

app.listen(3000, () => {
  console.log("server started !!!");
});

module.exports = app;
