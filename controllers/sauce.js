const Sauce = require("../models/sauces");
const fs = require("fs");
const { throws } = require("assert");

// function create sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    disLikes: 0,
    userLiked: [],
    userDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Object uploaded !" }))
    .catch((error) => res.status(400).json({ error }));
};

//function to get sauce by the id
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

//function to do modification for the sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Object modified !" }))
    .catch((error) => res.status(403).json({ error }));
};

//function delete sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      //controller if the user is connected to delet the object
      //comparing the userId who create object & userId that make action delete
      if (req.token.userId === sauce.userId) {
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Object deleted !" }))
            .catch((error) => res.status(403).json({ error }));
        });
      } else {
        throw "UserId is different with the userId object creator";
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

//function to get all the sauce
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

//Function like, disliked
exports.likeDataUser = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((objet) => {
      switch (req.body.likes) {
        case 1:
          if (
            !objet.userLiked.includes(req.body.userId) &&
            req.body.likes === 1
          ) {
            console.log("instructions executed");
            //update objet dans base de donner with operator $inc
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
              }
            )
              .then(() =>
                res.status(201).json({ message: "dataUser likes + 1" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        //disliked
        case -1:
          if (
            !objet.userDisliked.includes(req.body.userId) &&
            req.body.likes === -1
          ) {
            console.log("userDisliked et dislikes = 1");
            //update objet dans base de donner with operator $inc
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
              }
            )
              .then(() =>
                res.status(201).json({ message: "dataUser disliked + 1" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        // like = 0 means no like
        case 0:
          if (objet.userLiked.includes(req.body.userId)) {
            console.log("userLiked and case = 0");
            //update objet dans base de donner with operator $pull
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
              }
            )
              .then(() =>
                res.status(201).json({ message: "dataUser like = 0" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          if (objet.userDisliked.includes(req.body.userId)) {
            console.log("userDisliked and like = 0 ");
            //update objet dans base de donner
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() => res.status(201).json({ message: "dataUser like 0" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
