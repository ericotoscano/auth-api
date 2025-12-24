import { PaginationType } from "./pagination.types";

export type SignedUpUserDTOType = {
  userId: string;
  isVerified: boolean;
  createdAt: string;
};

export type VerifiedUserDTOType = {
  userId: string;
  isVerified: boolean;
  updatedAt: string;
};

export type LoggedInUserDTOType = {
  userId: string;
  accessToken: string;
  lastLogin: string;
  updatedAt: string;
};

export type FindAllUsersDTOType = {
  pagination: PaginationType;
  results: {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    createdAt: string;
  }[];
};

export type FindUserByIdDTOType = {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  isVerified: boolean;
  createdAt: string;
};

export type UpdateUserByIdDTOType = {
  userId: string;
  updatedFields: string[];
  updatedAt: string;
};

export type DeleteUserByIdDTOType = {
  userId: string;
  deletedAt: string;
};

export type RefreshedUserAccessTokenDTOType = {
  userId: string;
  accessToken: string;
  updatedAt: string;
};
