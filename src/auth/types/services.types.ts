import { UserType } from "../../shared/types/user.types";

export type SignUpServiceReturn = { createdUser: UserType; emailSent: boolean };

export type EmailServiceReturn = { emailSent: boolean };

export type UserAndTokenServiceReturn = {
  updatedUser: UserType;
  accessToken: string;
  refreshToken: string;
};
