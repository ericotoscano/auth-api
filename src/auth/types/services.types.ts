import { Types } from "mongoose";
import { UserCreated } from "../../shared/types/user.types";

export type EmailServiceReturn = { emailSent: boolean };

export type UserSession = {
  user: UserLoggedIn;
  accessToken: string;
  refreshToken: string;
};

export type UserSignedUp = {
  userCreated: UserCreated;
  emailSent: boolean;
};

export type UserForLogin = {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
};

export type UserLoggedIn = {
  _id: Types.ObjectId;
  updatedAt: Date;
};

export type UserForVerification = {
  _id: Types.ObjectId;
  verificationToken: string;
  isVerified: boolean;
};

export type UserVerified = {
  isVerified: boolean;
  updatedAt: Date;
};

export type UserForSendEmail = {
  _id: Types.ObjectId;
  username: string;
  isVerified: boolean;
};

export type UserForResetPassword = {
  _id: Types.ObjectId;
  password: string;
  resetPasswordToken: string;
  isVerified: boolean;
};

export type UserForAccess = {
  _id: Types.ObjectId;
  username: string;
  email: string;
};
