export class CustomError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly feedback: string,
    readonly errorCode: string,
    readonly details: Record<string, string>
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
}

export class BadRequestError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: string,
    details: Record<string, string>
  ) {
    super(message, 400, feedback, errorCode, details);
  }
}

export class ConflictError extends CustomError {
  constructor(
    message: string,
    feedback: string,
    errorCode: string,
    details: Record<string, string>
  ) {
    super(message, 409, feedback, errorCode, details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string, feedback: string, errorCode: string) {
    super(message, 401, feedback, errorCode, {});
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string, feedback: string, errorCode: string) {
    super(message, 403, feedback, errorCode, {});
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string, feedback: string, errorCode: string) {
    super(message, 404, feedback, errorCode, {});
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string, feedback: string, errorCode: string) {
    super(message, 500, feedback, errorCode, {});
  }
}

export class ExternalServiceError extends CustomError {
  constructor(message: string, feedback: string, errorCode: string) {
    super(message, 502, feedback, errorCode, {});
  }
}
