import { JwtPayload } from "jsonwebtoken";

export type TokenTypes =
  | "verification"
  | "resetPassword"
  | "access"
  | "refresh";

export interface EmailTokenClaims extends JwtPayload {
  username: string;
}

export interface VerifiedEmailToken extends EmailTokenClaims {
  rawToken: string;
}
export interface AccessTokenClaims extends JwtPayload {
  id: string;
  username: string;
  email: string;
}
export interface RefreshTokenClaims extends JwtPayload {
  id: string;
}

export type TokenClaims =
  | EmailTokenClaims
  | AccessTokenClaims
  | RefreshTokenClaims;

export type TokenClaimsByType = {
  verification: EmailTokenClaims;
  resetPassword: EmailTokenClaims;
  access: AccessTokenClaims;
  refresh: RefreshTokenClaims;
};

export interface TokenOptions {
  secret: string;
  expiresInMinutes: number;
  audience?: string;
  issuer?: string;
}
