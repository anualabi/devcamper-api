import express from "express";
import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} from "../controllers/reviews";

import Review from "../models/review";

import advancedResults from "../middleware/advancedResultsMiddleware";
import { protect, authorize } from "../middleware/auth";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);

export default router;
