const mongoose = require("mongoose"); //import mongoose

// le models:table user for the frontpage
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },

  // adding new options like/dislike
  like: { type: Number, defaut: 0 },
  disLikes: { type: Number, defaut: 0 },
  usersLiked: { type: [String] },
  usersDisliked: { type: [String] },
});

//export the module
module.exports = mongoose.model("sauces", sauceSchema);
