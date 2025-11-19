import { PaginationType } from "./pagination.types";
import { UserType } from "./user/user.type";

export type FindAllDTOType<T extends Record<string, any>> = {
  pagination: PaginationType;
  results: Partial<T>[];
};
export type UpdateByIdDTOType<T> = Partial<T> & { readonly updatedAt: string };

export type DeleteByIdDTOType<T extends { _id: string }> = Pick<T, "_id"> & {
  readonly deletedAt: string;
};

export type SignedUpUserDTOType = Pick<
  UserType,
  "_id" | "isVerified" | "createdAt"
>;

export type VerifiedUserDTOType = Pick<
  UserType,
  "_id" | "isVerified" | "updatedAt"
>;

export type LoggedInUserDTOType = Pick<
  UserType,
  "_id" | "lastLogin" | "updatedAt"
> & { accessToken: string };

export type RefreshedUserAccessTokenDTOType = Pick<
  UserType,
  "_id" | "updatedAt"
> & { accessToken: string };

export type FindUserByIdDTOType = Omit<
  UserType,
  | "email"
  | "password"
  | "resetPasswordToken"
  | "verificationToken"
  | "refreshToken"
  | "lastLogin"
  | "updatedAt"
>;