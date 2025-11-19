import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../config/CustomError.ts';

export const validateUserSelfPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Missing Authenticated User', 'No authenticated user found in request.', 'VALIDATE_USER_MISSING');
    }

    const authenticatedUserId = req.user._id;

    const targetUserId = req.params.userId;

    if (String(authenticatedUserId) !== String(targetUserId)) {
      throw new ForbiddenError('Forbidden Action', 'You do not have permission to perform this action for this user.', 'VALIDATE_USER_FORBIDDEN');
    }

    next();
  } catch (error) {
    next(error);
  }
};
