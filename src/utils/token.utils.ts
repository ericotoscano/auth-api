import type { Request } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, InternalServerError } from "../config/CustomError";
import { ENV } from "./env.utils";
import { TokenTypes, TokenPayload } from "../types/token.types";
import { TokenOptions } from "../types/user/services.types";

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
  verification: (req) =>
    (req.validated?.body as { token: string } | undefined)?.token,
  resetPassword: (req) =>
    (req.validated?.body as { token: string } | undefined)?.token,
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
        "AUTH_EXPIRED_TOKEN",
        { type }
      );
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new UnauthorizedError(
        "Inactive Token",
        "The token is not active yet.",
        "AUTH_INACTIVE_TOKEN",
        { type }
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throwInvalidTokenError(type);
    }

    throw new InternalServerError(
      "Token Validation Failed",
      "An unexpected error occurred while validating the token.",
      "SYSTEM_TOKEN_VALIDATION_FAILED",
      { type }
    );
  }
};

export const throwInvalidTokenError = (type: TokenTypes) => {
  throw new UnauthorizedError(
    "Invalid Token",
    "The token is invalid.",
    "AUTH_INVALID_TOKEN",
    { type }
  );
};
