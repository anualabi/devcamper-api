import { Request, Response, NextFunction } from "express";

import ErrorResponse from "../utilities/errorResponse";

type ErrorHandlerError = ErrorResponse & {
  code?: number;
  errors?: Record<string, any>;
  value?: string;
};

const handleCastError = (error: ErrorHandlerError) => {
  const message = `Resource not found.`;
  return new ErrorResponse(message, 404);
};

const handleValidationError = (error: ErrorHandlerError) => {
  const message = Object.values(error.errors)
    .map((value: any) => value.message)
    .join(", ");
  return new ErrorResponse(message, 400);
};

const handleMongoError = (error: ErrorHandlerError) => {
  switch (error.code) {
    case 11000:
      return new ErrorResponse("Duplicate field.", 400);
    // Handle other Mongo error codes as needed
    default:
      return new ErrorResponse("Mongo Error.", 500);
  }
};

const handleJsonWebTokenError = () => {
  return new ErrorResponse("Not authorized.", 401);
};

const handleTokenExpiredError = () => {
  return new ErrorResponse("Please log in again", 401);
};

const errorHandler = (
  err: ErrorHandlerError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };

  // Log to console for dev
  console.log(err);

  switch (err.name) {
    case "CastError":
      error = handleCastError(error);
      break;
    case "ValidationError":
      error = handleValidationError(error);
      break;
    case "MongoServerError":
      error = handleMongoError(error);
      break;
    case "JsonWebTokenError":
      error = handleJsonWebTokenError();
      break;
    case "TokenExpiredError":
      error = handleTokenExpiredError();
      break;

    default:
      error.message = err.message || "Server Error";
      error.statusCode = err.statusCode || 500;
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
  });
};

export default errorHandler;
