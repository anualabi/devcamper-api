import express from "express";

// Import controller
import {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courses";

import Course from "../models/course";

import advancedResultsMiddleware from "../middleware/advancedResultsMiddleware";
import {
  protect,
  authorize,
  checkExistenceOwnership,
} from "../middleware/auth";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResultsMiddleware(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(
    protect,
    authorize("publisher", "admin"),
    checkExistenceOwnership(Course),
    updateCourse
  )
  .delete(protect, authorize("publisher", "admin"), deleteCourse);

export default router;
