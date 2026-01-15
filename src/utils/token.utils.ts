import type { Request } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, InternalServerError } from "../config/CustomError";
import { ENV } from "./env.utils";
import {
  TokenTypes,
  TokenPayload,
  TokenOptions,
} from "../types/auth/auth.token.types";

const tokenMessageByType = {
  verification: "VERIFICATION_TOKEN",
  resetPassword: "RESET_PASSWORD_TOKEN",
  access: "ACCESS_TOKEN",
  refresh: "REFRESH_TOKEN",
} as const;

const getTokenOptionsByType = (type: TokenTypes): TokenOptions => {
  return {
    secret: ENV[`${tokenMessageByType[type]}_SECRET_KEY`],
    expiresInMinutes: Number(
      ENV[`${tokenMessageByType[type]}_DURATION_MINUTES`]
    ),
    audience: `urn:jwt:type:${type}`,
    issuer: `urn:system:token-issuer:type:${type}`,
  };
};

export const getTokenFromRequest: Record<
  TokenTypes,
  (req: Request) => string | undefined
> = {
  verification: (req) => req.body?.token,
  resetPassword: (req) => req.headers.authorization?.replace("Bearer ", ""),
  access: (req) => req.headers.authorization?.replace("Bearer ", ""),
  refresh: (req) => req.cookies[ENV.REFRESH_TOKEN_COOKIE_NAME],
} as const;

export const createToken = (
  payload: TokenPayload,
  type: TokenTypes
): string => {
  const { secret, expiresInMinutes, audience, issuer } =
    getTokenOptionsByType(type);

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
    const { secret } = getTokenOptionsByType(type);

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
