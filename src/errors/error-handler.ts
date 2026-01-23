import { Request, Response, NextFunction } from "express";
import { CustomError } from "./custom-error";
import { logger } from "../infra/logger/logger";
import {
  conditionalErrorCodes,
  errorLevel,
  internalOnlyErrorCodes,
} from "./error-codes";

export const appErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.locals.__hasError = true;

  let normalizedError = err;

  if (err instanceof CustomError) {
    const isInternalOnly =
      internalOnlyErrorCodes.has(err.errorCode) ||
      conditionalErrorCodes.has(err.errorCode);

    if (isInternalOnly) {
      normalizedError = new CustomError(
        "Unexpected Error",
        500,
        "An unexpected error occurred while processing your request.",
        "SYSTEM_UNEXPECTED",
      );
    }
  } else {
    normalizedError = new CustomError(
      "Unexpected Error",
      500,
      "An unexpected error occurred while processing your request.",
      "SYSTEM_UNEXPECTED",
    );
  }

  const customError = normalizedError as CustomError;

  const responseBody = {
    success: false,
    message: customError.message,
    errorCode: customError.errorCode,
    feedback: customError.feedback,
    ...(customError.details &&
    customError.errorCode !== "USER_CONFLICT" &&
    Object.keys(customError.details).length > 0
      ? { details: customError.details }
      : {}),
  };

  const logLevel = errorLevel[customError.errorCode] ?? "error";

  logger[logLevel](customError.message, {
    errorCode: customError.errorCode,
    originalErrorCode: err instanceof CustomError ? err.errorCode : undefined,
    details: err instanceof CustomError ? err.details : undefined,
    stack: logLevel === "error" ? (err as Error).stack : undefined,
    statusCode: customError.statusCode,
    method: req.method,
    path: req.originalUrl.split("?")[0],
    ip: req.ip,
  });

  return res.status(customError.statusCode).json(responseBody);
};
