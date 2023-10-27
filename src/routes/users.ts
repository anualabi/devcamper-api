import express from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users";

import User from "../models/user";

import advancedResultsMiddleware from "../middleware/advancedResultsMiddleware";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router
  .route("/")
  .get(advancedResultsMiddleware(User), getUsers)
  .post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
