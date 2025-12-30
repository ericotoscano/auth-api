import { UserType } from "../user/user.type";

export type EmailServiceReturn = { emailSent: boolean };

export type LoginServiceReturn = {
  loggedInUser: UserType;
  accessToken: string;
  refreshToken: string;
};

export type RefreshUserAccessTokenServiceReturn = {
  refreshedUserAccessToken: UserType & { accessToken: string };
  refreshToken: string;
};
