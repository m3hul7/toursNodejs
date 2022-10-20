const express = require("express");

const tourController = require("./../controllers/toursControllers");

const router = express.Router();

// router which does not include query params
router
  .route("/")
  .get(tourController.gettours)
  .post(tourController.posttour);

// router which does include query params
router
  .route("/:id")
  .get(tourController.gettourbyid)
  .patch(tourController.updatetour)
  .delete(tourController.deletetour);

module.exports = router;
