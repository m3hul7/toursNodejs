const express = require("express");

const tourController = require("./../controllers/toursControllers");

const router = express.Router();

router.route("/top-five").get(tourController.aliasTopFive,tourController.gettours)

router.route("/tour-stats").get(tourController.getToursStats)

router.route("/tour-monthly-plan/:year").get(tourController.getMonthlyPlan)

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
