const mongoose = require("mongoose"); //manages relationships between data(donnees), provides schema validation
const uniqueValidator = require("mongoose-unique-validator"); //a plugin which adds pre-save validation for unique fields within a Mongoose schema

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
