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
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
  const userId = decodedToken.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //Function security only the owner of object can do the modification
      if (req.file && sauce.userId == userId) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) throw error;
        }).catch((error) => {
          res.status(403).json({ error });
        });
      }
      if (sauce.userId == userId) {
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
      } else {
        res
          .status(403)
          .json({ message: "only user who created can modify" })
          .catch((error) => res.status(403).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
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
exports.likeSauce = (req, res, next) => {
  const like = JSON.parse(req.body.like);
  console.log("like", like);
  Sauce.findOne({ _id: req.params.id })
    .then((Sauce) => {
      switch (like) {
        case 1:
          //update objet dans base de donner with operator $inc
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: req.body.userId },
            }
          )
            .then(() => res.status(201).json({ message: "userlikes + 1" }))
            .catch((error) => res.status(400).json({ error }));

          break;

        //disliked
        case -1:
          //update objet dans base de donner with operator $inc
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: req.body.userId },
            }
          )
            .then(() => res.status(201).json({ message: "user disliked + 1" }))
            .catch((error) => res.status(400).json({ error }));

          break;

        // like = 0 means neutral
        case 0:
          Sauce.userLiked.includes(req.body.userId);
          //update objet dans base de donner with operator $pull
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
            }
          )
            .then(() => res.status(201).json({ message: "userliked = 0" }))
            .catch((error) => res.status(400).json({ error }));

          Sauce.userDisliked.includes(req.body.userId);
          //update objet dans base de donner
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
            }
          )
            .then(() => res.status(201).json({ message: "userdisliked 0" }))
            .catch((error) => res.status(400).json({ error }));

          break;
        default:
      }
    })
    .catch((error) => res.status(404).json({ error }));
};
