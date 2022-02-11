const express = require("express"); //Creates an Express application.
const router = express.Router(); //Create separate routers for each main route.

const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
