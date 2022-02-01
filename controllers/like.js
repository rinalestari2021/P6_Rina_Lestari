const req = require("express/lib/request");
const res = require("express/lib/response");
const sauce = require("../routes/sauce");

// if user like
sauce
  .findOne({ _id: req.params.id })
  .then((objet) => {
    switch (req.body.like) {
      case 1:
        if (!objet.userLiked.includes(req.body.userId) && req.body.like === 1) {
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
            .then(() => res.status(201).json({ message: "dataUser like + 1" }))
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
            .then(() => res.status(201).json({ message: "dataUser like = 0" }))
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
