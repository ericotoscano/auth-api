import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/token.types";
import { TokenOptions } from "../types/services.types";

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
