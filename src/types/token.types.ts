import { JwtPayload } from "jsonwebtoken";

export type TokenTypes =
  | "verification"
  | "resetPassword"
  | "access"
  | "refresh";

export interface EmailTokenPayload extends JwtPayload {
  username: string;
}
export interface AccessTokenPayload extends JwtPayload {
  id: string;
  username: string;
  email: string;
}
export interface RefreshTokenPayload extends JwtPayload {
  id: string;
}

export type TokenPayload =
  | EmailTokenPayload
  | AccessTokenPayload
  | RefreshTokenPayload;
