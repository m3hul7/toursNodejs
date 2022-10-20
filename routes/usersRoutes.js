const express = require("express");

const userController = require("./../controllers/usersControllers");

const router = express.Router();

// router which does not include query params
router.route("/").get(userController.getusers).get(userController.postuser);

// router which does include query params
router
  .route("/:id")
  .get(userController.gettuserbyid)
  .get(userController.updateuser)
  .get(userController.deleteuser);

module.exports = router;
