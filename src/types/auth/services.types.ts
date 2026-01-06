import { UserType } from "../user/user.type";

export type EmailServiceReturn = { emailSent: boolean };

export type UserAndTokenServiceReturn = {
  updatedUser: UserType;
  accessToken: string;
  refreshToken: string;
};
