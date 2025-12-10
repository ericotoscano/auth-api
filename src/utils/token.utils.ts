import type { Request } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, InternalServerError } from "../config/CustomError";
import { ENV } from "./env.utils";
import { TokenTypes, TokenPayload } from "../types/token.types";
import { TokenOptions } from "../types/services.types";

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

export const createToken = (
  payload: TokenPayload,
  options: TokenOptions
): string => {
  const { secret, expiresInMinutes, audience, issuer } = options;

  return jwt.sign(payload, secret, {
    expiresIn: expiresInMinutes * 60,
    audience,
    issuer,
  });
};

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
        "The token has expired. Please request a new one.",
        "EXPIRED_TOKEN_ERROR",
        { type }
      );
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new UnauthorizedError(
        "Not Active Token",
        "The token is not active yet.",
        "NOT_ACTIVE_TOKEN_ERROR",
        { type }
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError(
        "Invalid Token",
        "The token is invalid or has been tampered with.",
        "INVALID_TOKEN_ERROR",
        { type }
      );
    }

    throw new InternalServerError(
      "Failed to Checking Token",
      `An unexpected error occurred while checking the token.`,
      `CHECK_TOKEN_ERROR`,
      { type }
    );
  }
};
