const express = require("express")

const app = express()

app.get("/", function (req, res) {
  res.send("hello world")
})

app.get("/example", function (req, res) {
  res.send("hello from Example  2!!!")
})

app.listen(3000, () => {
  console.log("server started !!!")
})
