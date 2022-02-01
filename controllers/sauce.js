const sauce = require("../models/sauces");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const Sauce = new sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  Sauce.save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  sauce
    .findOne({
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

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  sauce
    .updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  sauce
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        sauce
          .deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  sauce
    .find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.likeDataUser = (req, res, next) => {
  sauce
    .findOne({ _id: req.params.id })
    .then((objet) => {
      switch (req.body.like) {
        case 1:
          if (
            !objet.userLiked.includes(req.body.userId) &&
            req.body.like === 1
          ) {
            console.log("instructions execute");
            //update objet dans base de donner with operator $inc
            sauce
              .updateOne(
                { _id: req.params.id },
                {
                  $inc: { like: 1 },
                  $push: { usersLiked: req.body.userId },
                }
              )
              .then(() =>
                res.status(201).json({ message: "dataUser like + 1" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        case -1:
          //disliked
          if (
            !objet.userDisliked.includes(req.body.userId) &&
            req.body.like === -1
          ) {
            console.log("userDisliked et dislikes = 1");
            //update objet dans base de donner with operator $inc
            sauce
              .updateOne(
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
        case 0:
          // like = 0 means no like
          if (objet.userLiked.includes(req.body.userId)) {
            console.log("userLiked and case = 0");
            //update objet dans base de donner with operator $pull
            sauce
              .updateOne(
                { _id: req.params.id },
                {
                  $inc: { like: -1 },
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
            sauce
              .updateOne(
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
