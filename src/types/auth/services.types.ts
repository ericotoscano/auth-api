import { UserType } from "../users/users.types";

export type EmailServiceReturn = { emailSent: boolean };

export type UserAndTokenServiceReturn = {
  updatedUser: UserType;
  accessToken: string;
  refreshToken: string;
};
