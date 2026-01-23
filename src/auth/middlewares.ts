import type { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { NotFoundError, UnauthorizedError } from "../errors/custom-error.ts";
import { findUserDocumentService, findUserService } from "../users/services.ts";
import {
  verifyTokenClaims,
  extractTokenFromRequest,
} from "./services/token.services.ts";

import { EmailTokenClaims, TokenTypes } from "./types/token.types.ts";
import { ENV } from "../infra/env/env.ts";
import { mapUserDocumentToUser } from "../users/mappers.ts";

export const validateToken =
  (type: TokenTypes): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenToValidate = extractTokenFromRequest[type](req);
      console.log(tokenToValidate);

      if (!tokenToValidate) {
        throw new UnauthorizedError(
          "Missing Token",
          "No token was provided.",
          "AUTH_MISSING_TOKEN",
          { type },
        );
      }

      const claims = await verifyTokenClaims(type, tokenToValidate);

      req.validated ??= {};

      switch (type) {
        case "verification":
        case "resetPassword": {
          req.validated.token = {
            ...(claims as EmailTokenClaims),
            rawToken: tokenToValidate,
          };
          break;
        }

        case "access": {
          try {
            const user = await findUserService({ _id: claims.id });

            req.validated.token = claims;
            req.validated.user = user;
          } catch (err) {
            if (err instanceof NotFoundError) {
              throw new UnauthorizedError(
                "Invalid Token",
                "The token is invalid.",
                "AUTH_INVALID_TOKEN",
                { type: "access" },
              );
            }
            throw err;
          }
          break;
        }

        case "refresh": {
          try {
            const userDocument = await findUserDocumentService(
              { _id: claims.id },
              { select: "+refreshToken" },
            );

            if (!userDocument.refreshToken) {
              res.clearCookie(ENV.REFRESH_TOKEN_COOKIE_NAME);
              throw new UnauthorizedError(
                "Invalid Token",
                "The token is invalid.",
                "AUTH_INVALID_TOKEN",
                { type: "refresh" },
              );
            }

            const isValid = await bcrypt.compare(
              tokenToValidate,
              userDocument.refreshToken,
            );

            if (!isValid) {
              res.clearCookie(ENV.REFRESH_TOKEN_COOKIE_NAME);
              throw new UnauthorizedError(
                "Invalid Token",
                "The token is invalid.",
                "AUTH_INVALID_TOKEN",
                { type: "refresh" },
              );
            }

            req.validated.token = claims;
            req.validated.user = mapUserDocumentToUser(userDocument);
          } catch (err) {
            if (err instanceof NotFoundError) {
              res.clearCookie(ENV.REFRESH_TOKEN_COOKIE_NAME);

              throw new UnauthorizedError(
                "Invalid Token",
                "The token is invalid.",
                "AUTH_INVALID_TOKEN",
                { type: "refresh" },
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
