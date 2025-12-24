import { JwtPayload } from 'jsonwebtoken';

export type TokenTypes = 'verification' | 'resetPassword' | 'access' | 'refresh';

export interface VerificationTokenPayload extends JwtPayload {
  username: string;
}
export interface ResetPasswordTokenPayload extends JwtPayload {
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
export type TokenPayload = VerificationTokenPayload | ResetPasswordTokenPayload | AccessTokenPayload | RefreshTokenPayload;
