import { Request, Response, NextFunction } from "express";
import { CustomError } from "../config/CustomError";

export const appErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      feedback: err.feedback,
      details: err.details,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Unexpected Error",
    errorCode: "UNEXPECTED_ERROR",
    feedback: "An unexpected error occurred while processing your request.",
    details: {},
  });
};
