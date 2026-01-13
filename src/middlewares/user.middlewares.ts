import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../config/CustomError.ts";

export const validateUserSelfPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.validated!.user) {
      throw new UnauthorizedError(
        "Unauthorized",
        "Authentication is required to perform this action.",
        "AUTH_UNAUTHORIZED"
      );
    }

    const authenticatedUserId = req.validated!.user._id;

    const { id: targetUserId } = req.validated!.params as { id: string };

    if (String(authenticatedUserId) !== String(targetUserId)) {
      throw new ForbiddenError(
        "Forbidden",
        "You do not have permission to perform this action.",
        "AUTH_FORBIDDEN"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
