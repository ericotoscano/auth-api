import type { Request } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, InternalServerError } from "../config/CustomError";
import { ENV } from "./env.utils";
import { TokenTypes, TokenPayload } from "../types/token.types";

const tokenSecrets: Record<TokenTypes, string> = {
  verification: ENV.VERIFICATION_TOKEN_SECRET_KEY,
  resetPassword: ENV.RESET_PASSWORD_TOKEN_SECRET_KEY,
  access: ENV.ACCESS_TOKEN_SECRET_KEY,
  refresh: ENV.REFRESH_TOKEN_SECRET_KEY,
};

export const getTokenFromRequest: Record<
  TokenTypes,
  (req: Request) => string | undefined
> = {
  verification: (req) => req.params.token,
  resetPassword: (req) => req.params.token,
  access: (req) => req.headers.authorization?.replace("Bearer ", ""),
  refresh: (req) => req.cookies[ENV.REFRESH_TOKEN_COOKIE_NAME],
} as const;

export const checkToken = async (
  type: TokenTypes,
  token: string
): Promise<TokenPayload> => {
  try {
    const secret = tokenSecrets[type];

    return jwt.verify(token, secret) as TokenPayload;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError(
        "Expired Token",
        `The ${type} token has expired. Please request a new one.`,
        `CHECK_${type.toUpperCase()}_EXPIRED`
      );
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new UnauthorizedError(
        "Not Active Token",
        `The ${type} token is not active yet.`,
        `CHECK_${type.toUpperCase()}_NOT_ACTIVE`
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError(
        "Invalid Token",
        `The ${type} token is invalid or has been tampered with.`,
        `CHECK_${type.toUpperCase()}_INVALID`
      );
    }

    throw new InternalServerError(
      "Failed to Checking Token",
      `An unexpected error occurred while checking the ${type} token.`,
      `CHECK_${type.toUpperCase()}_INTERNAL`
    );
  }
};
