const Sauce = require("../models/sauces");
const fs = require("fs"); //The fs module enables interacting with the file system in a way modeled on standard POSIX functions.
const { throws } = require("assert"); //The assert module provides a set of assertion functions for verifying invariants.

// function create sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    userLiked: [],
    userDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

//function to get one sauce by the id
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
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.token) {
        res.status(403).json({ message: "Non autorisé" });
      }
      //Function security only the owner of object can do the modification
      if (req.file) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          const sauceObject = {
            ...req.body,
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          };
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce mise à jour!" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
      if (!req.file) {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...req.body, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(403).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

//function delete sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.token) {
        res.status(403).json({ message: "Non autorisé" });
      }
      const filename = sauce.imageUrl.split("/images/")[1];
      //controller if the user is connected to delet the object
      //comparing the userId who create object & userId that make action delete
      if (req.token === sauce.userId) {
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet suprimer !" }))
            .catch((error) => res.status(403).json({ error }));
        });
      } else {
        throw "UserId est différent avec le créateur de l'objet userId";
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
exports.likeSauce = (req, res, next) => {
  const like = JSON.parse(req.body.like);
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (like) {
        case 1:
          //update object inside BDD with operator $inc
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: req.body.userId },
            }
          )
            .then(() => res.status(201).json({ message: "User like + 1" }))
            .catch((error) => res.status(400).json({ error }));

          break;

        //disliked
        case -1:
          //update object inside BDD with operator $inc
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: req.body.userId },
            }
          )
            .then(() => res.status(201).json({ message: "User disliked + 1" }))
            .catch((error) => res.status(400).json({ error }));

          break;

        // like = 0 means neutral
        case 0:
          if (sauce.usersLiked.includes(req.body.userId)) {
            //update object BDD with operator $pull
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
              }
            )
              .then(() => res.status(201).json({ message: "User like = 0" }))
              .catch((error) => res.status(400).json({ error }));
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            //update object inside BDD
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() => res.status(201).json({ message: "User disliked 0" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        default:
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
