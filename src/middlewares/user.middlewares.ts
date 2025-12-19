import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../config/CustomError.ts";

export const validateUserSelfPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError(
        "Missing Authenticated User",
        "No authenticated user found in request.",
        "MISSING_USER_ERROR",
        {}
      );
    }

    const authenticatedUserId = req.user._id;

    const targetUserId = req.params.id;

    if (String(authenticatedUserId) !== String(targetUserId)) {
      throw new ForbiddenError(
        "Forbidden Action",
        "You do not have permission to perform this action for this user.",
        "FORBIDDEN_ACTION_ERROR",
        {}
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
