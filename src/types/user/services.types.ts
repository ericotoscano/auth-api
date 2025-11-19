import { UserType } from "./user.type";

export type SignUpServiceReturn = { createdUser: UserType; emailSent: boolean };

export type FindUserFilters =
  | { _id: string }
  | { username: string }
  | { email: string };

export type UserUpdateFields = Partial<
  Pick<
    UserType,
    | "firstName"
    | "lastName"
    | "username"
    | "email"
    | "password"
    | "isVerified"
    | "resetPasswordToken"
    | "verificationToken"
    | "refreshToken"
    | "lastLogin"
  >
>;
