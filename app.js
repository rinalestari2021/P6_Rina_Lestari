const express = require("express");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authority"
  );
  res.setHeader(
    "Access-Control-Allow-Origin",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.post("/api/stuff", (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: "Objet créé !",
  });
});

app.use((req, res, next) => {
  res.status(201);
  next();
});

app.use((req, res, next) => {
  res.json({ message: "Votre requête a bien été recue !" });
  next();
});

app.use((req, res) => {
  console.log("Réponse envoyée avec succès !");
});

module.express = app;
