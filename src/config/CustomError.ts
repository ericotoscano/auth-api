import { ErrorCode } from "../types/error.types";

export class CustomError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly feedback: string,
    readonly errorCode: ErrorCode,
    readonly details?: Record<string, unknown>
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;

    Object.freeze(this);
  }
}

export class BadRequestError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message, 400, feedback, errorCode, details);
  }
}

export class ConflictError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message, 409, feedback, errorCode, details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message, 401, feedback, errorCode, details);
  }
}

export class ForbiddenError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message, 403, feedback, errorCode, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message, 404, feedback, errorCode, details);
  }
}

export class InternalServerError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message, 500, feedback, errorCode, details);
  }
}

export class ExternalServiceError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message, 502, feedback, errorCode, details);
  }
}
