import type { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { NotFoundError, UnauthorizedError } from "../config/CustomError";
import { findUserService } from "../services/user.services.ts";
import { TokenTypes } from "../types/token.types.ts";
import { checkToken, getTokenFromRequest } from "../utils/token.utils.ts";
import { ENV } from "../utils/env.utils.ts";

export const validateToken =
  (type: TokenTypes): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenToValidate = getTokenFromRequest[type](req);

      if (!tokenToValidate) {
        throw new UnauthorizedError(
          "Missing Token",
          `No ${type} token was provided.`,
          `VALIDATE_${type.toUpperCase()}_MISSING`
        );
      }

      const payload = await checkToken(type, tokenToValidate);

      switch (type) {
        case "verification":
        case "resetPassword": {
          req.tokenPayload = payload;
          break;
        }

        case "access": {
          try {
            const user = await findUserService({ _id: payload._id });

            req.tokenPayload = payload;
            req.user = user;
          } catch (err) {
            if (err instanceof NotFoundError) {
              throw new UnauthorizedError(
                "Invalid Access Token",
                "The access token is no longer valid because the associated user does not exist.",
                "VALIDATE_ACCESS_USER_UNAUTHORIZED"
              );
            }
            throw err;
          }
          break;
        }

        case "refresh": {
          try {
            const user = await findUserService(
              { _id: payload._id },
              "+refreshToken"
            );

            const isValid = await bcrypt.compare(
              tokenToValidate,
              user.refreshToken
            );
            if (!isValid) {
              res.clearCookie(ENV.REFRESH_TOKEN_COOKIE_NAME);
              throw new UnauthorizedError(
                "Invalid Refresh Token",
                "The provided refresh token is invalid or has expired.",
                "VALIDATE_REFRESH_USER_UNAUTHORIZED"
              );
            }

            req.tokenPayload = payload;
            req.user = user;
          } catch (err) {
            if (err instanceof NotFoundError) {
              res.clearCookie(ENV.REFRESH_TOKEN_COOKIE_NAME);
              throw new UnauthorizedError(
                "Invalid Refresh Token",
                "The refresh token is no longer valid because the associated user does not exist.",
                "VALIDATE_REFRESH_USER_NOT_FOUND"
              );
            }
            throw err;
          }
          break;
        }
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
