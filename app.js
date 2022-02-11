const express = require("express"); // creating framework express
const rateLimit = require("express-rate-limit"); //Use to limit repeated requests to public APIs and/or endpoints such as password reset
const helmet = require("helmet"); // security for express app by setting various HTTP headers

const mongoose = require("mongoose"); //cookies database noSQL
const path = require("path");

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

const dotenv = require("dotenv").config({ encoding: "latin1" }); //using dotenv to manage env variables in nodejs

// acces to BBD
mongoose
  .connect(process.env.MONGOOSE_KEY, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connecté à MongoDB !"))
  .catch(() => console.log("Impossible de se connecter à MongoDB !"));

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

app.use(
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 100,
    message:
      "Vous avez effectué plus de 100 requétes dans une limite de 24 heures!",
    headers: true,
  })
);

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
