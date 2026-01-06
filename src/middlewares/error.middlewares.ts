import { Request, Response, NextFunction } from "express";
import { CustomError } from "../config/CustomError";
import { logger } from "../utils/logger";
import { errorCodes } from "../types/error.types";

export const appErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.__hasError = true;

  const baseResponse =
    err instanceof CustomError
      ? {
          success: false,
          message: err.message,
          errorCode: err.errorCode,
          feedback: err.feedback,
        }
      : {
          success: false,
          message: "Unexpected Error",
          errorCode: "UNEXPECTED_ERROR",
          feedback:
            "An unexpected error occurred while processing your request.",
        };

  const errorResponse =
    err instanceof CustomError &&
    err.details &&
    err.errorCode !== "USER_CONFLICT" &&
    Object.keys(err.details).length > 0
      ? {
          ...baseResponse,
          details: err.details,
        }
      : baseResponse;

  const logLevel =
    err instanceof CustomError && errorCodes.includes(err.errorCode)
      ? "warn"
      : "error";

  logger.error(errorResponse.message || "Unexpected Error", {
    errorCode: errorResponse.errorCode || "UNEXPECTED_ERROR",
    details: err instanceof CustomError ? err.details : undefined,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl.split("?")[0],
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return res.status(err?.statusCode ?? 500).json(errorResponse);
};
