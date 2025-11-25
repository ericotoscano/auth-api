import { Request, Response, NextFunction } from "express";
import { ConflictError, CustomError } from "../config/CustomError";
import { logger } from "../utils/logger";
import { formatErrorDetails } from "../utils/error.utils";

export const appErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResponse =
    err instanceof CustomError
      ? {
          success: false,
          message: err.message,
          errorCode: err.errorCode,
          feedback: err.feedback,
          details:
            err instanceof ConflictError
              ? formatErrorDetails(err.details)
              : err.details,
        }
      : {
          success: false,
          message: err.message || "Unexpected Error",
          errorCode: "UNEXPECTED_ERROR",
          feedback:
            "An unexpected error occurred while processing your request.",
          details: {},
        };

  logger.error(errorResponse.message || "Unexpected Error", {
    errorCode: errorResponse.errorCode || "UNEXPECTED_ERROR",
    details: err.details || {},
    stack: err.stack,
  });

  return res.status(err?.statusCode ?? 500).json(errorResponse);
};
