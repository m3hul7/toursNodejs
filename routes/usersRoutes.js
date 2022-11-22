const express = require("express");

const userController = require("./../controllers/usersControllers");
const authController = require("./../controllers/authControllers");

const router = express.Router();

router.post('/sign-up', authController.signup)
router.post('/log-in', authController.login)

router.post('/fortget-password', authController.forgetPassword)
router.patch('/reset-password/:token', authController.resetPassword)
router.patch('/update-password/',authController.protect ,authController.updatePassword)

router.patch('/update-me', authController.protect, userController.updateMe)
router.delete('/delete-me', authController.protect, userController.deleteMe)

// router which does not include query params
router.route("/").get(userController.getusers).get(userController.postuser);

// router which does include query params
router
  .route("/:id")
  .get(userController.gettuserbyid)
  .get(userController.updateuser)
  .get(userController.deleteuser);

module.exports = router;
