const express = require("express"); // creating framework express
const helmet = require("helmet"); // security for express app by setting various HTTP headers

const mongoose = require("mongoose"); //cookies database noSQL
const path = require("path");

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// acces to BBD
mongoose
  .connect(
    "mongodb+srv://RinaL2021:Rina2022@cluster0.chx2x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB !"))
  .catch(() => console.log("Can not connected to MongoDB !"));

//Creates an Express application.
const app = express();

//assign middleware to application specific route
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

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
