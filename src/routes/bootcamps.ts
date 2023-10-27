import express from "express";

import {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} from "../controllers/bootcamps";

import Bootcamp from "../models/bootcamp";

import advancedResultsMiddleware from "../middleware/advancedResultsMiddleware";
import {
  protect,
  authorize,
  checkExistenceOwnership,
} from "../middleware/auth";

// Include other resource routers
import courseRouter from "./courses";
import reviewRouter from "./reviews";

const router = express.Router();

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
router
  .route("/:id/photo")
  .put(
    protect,
    authorize("publisher", "admin"),
    checkExistenceOwnership(Bootcamp),
    bootcampPhotoUpload
  );
router
  .route("/")
  .get(advancedResultsMiddleware(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(
    protect,
    authorize("publisher", "admin"),
    checkExistenceOwnership(Bootcamp),
    updateBootcamp
  )
  .delete(
    protect,
    authorize("publisher", "admin"),
    checkExistenceOwnership(Bootcamp),
    deleteBootcamp
  );

export default router;
