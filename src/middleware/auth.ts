import { Response, NextFunction } from "express";
import { Model } from "mongoose";
import config from "config";
import jwt from "jsonwebtoken";

import asyncHandler from "./async";
import ErrorResponse from "../utilities/errorResponse";
import User from "../models/user";
import { RequestWithUser } from "../types/user";

// Protect routes
export const protect = asyncHandler(async (req: RequestWithUser, res, next) => {
  let token: string | null = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }
  // Set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  // Verify token
  const decoded: any = jwt.verify(token, config.get<string>("jwtSecret"));

  req.user = await User.findById(decoded.id);

  next();
});

// Grant access to specific roles
export function authorize(...roles: string[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.user && req.user.role) {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorResponse(
            `User role ${req.user.role} is not authorized to access this route`,
            403
          )
        );
      }
    } else {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
    next();
  };
}

// Check existence and ownership of resource
export const checkExistenceOwnership = (model: Model<any>) =>
  asyncHandler(async (req: RequestWithUser, res, next) => {
    if (req.user?.role !== "admin") {
      const resource = await model.findById(req.params.id);

      // Check that resource exists
      if (!resource) {
        const errorMessage = `Resource not found with id of ${req.params.id}`;
        return next(new ErrorResponse(errorMessage, 404));
      }

      // If resource exists, make sure user owns the resource, unless they're admin
      if (resource.user.toString() !== req.user?.id) {
        const errorMessage = `You don't have permission to modify that resource.`;
        return next(new ErrorResponse(errorMessage, 403));
      }
    }

    next();
  });
