import { Request, Response, NextFunction } from "express";
import { CustomError } from "../config/CustomError";
import { logger } from "../utils/logger";
import { errorCodes, errorLevel } from "../types/error.types";

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
    err instanceof CustomError ? errorLevel[err.errorCode] ?? "error" : "error";

  logger[logLevel](errorResponse.message, {
    errorCode: errorResponse.errorCode,
    details: err instanceof CustomError ? err.details : undefined,
    stack: logLevel === "error" ? err.stack : undefined,
    method: req.method,
    path: req.originalUrl.split("?")[0],
    ip: req.ip,
  });

  return res.status(err?.statusCode ?? 500).json(errorResponse);
};
