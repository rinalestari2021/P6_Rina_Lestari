const express = require("express"); //Creates an Express application.

const mongoose = require("mongoose"); // import mongoose

const items = require("./routes/items"); // import path for stuff

const app = express();

// connected to data(donnéer) server
mongoose
  .connect(
    "mongodb+srv://RinaL2021@cluster0-shard-00-01.chx2x.mongodb.net/test?retryWrites=true&w=majority", // I dont know which one
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Success connected with MongoDB"))
  .catch(() => console.log("Connection MongoDB error "));

// Request handler to access data using API
app.use(express.json());

// option 1 question do i need to create sauces.js or ?
app.get("/api/sauces", function (req, res) {
  res.send("hello world");
});

app.get("/api/sauces/:id", function (req, res) {
  res.send("hello from Example  2!!!");
});

app.listen(3000, () => {
  console.log("server started !!!");
});

// option 2
app.post("/api/items", (req, res, next) => {
  delete req.body._id;
  const items = new items({
    ...req.body,
  });
  items
    .save() //save items
    .then(() => res.status(201).json({ message: "Object save" }))
    .catch((error) => res.status(400).json({ error }));
});

//return a single thing based on the comparison of function
app.use("/api/items", (req, res, next) => {
  items
    .find()
    .then((items) => res.status(200).json(items))
    .catch((error) => res.status(400).json({ error }));
});

// give one object by their unique id
app.get("/api/items/:id", (req, res, next) => {
  items
    .findOne({ _id: req.params.id })
    .then((items) => res.status(200).json(items))
    .catch((error) => res.status(404).json({ error }));
});

// for modify items
app.put("api/items/:id", (req, res, next) => {
  items
    .updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Object modified" }))
    .catch((error) => res.status(400).json({ error }));
});

// deleting items
app.delete("/api/items/:id", (req, res, next) => {
  items
    .deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Object deleted" }))
    .catch((error) => res.status(400).json({ error }));
});
