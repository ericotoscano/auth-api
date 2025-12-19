import { PaginationType } from "./pagination.types";

export type SignedUpUserDTOType = {
  id: string;
  isVerified: boolean;
  createdAt: string;
};

export type VerifiedUserDTOType = {
  id: string;
  isVerified: boolean;
  updatedAt: string;
};

export type LoggedInUserDTOType = {
  id: string;
  accessToken: string;
  lastLogin: string;
  updatedAt: string;
};

export type FindAllUsersDTOType = {
  pagination: PaginationType;
  results: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    createdAt: string;
  }[];
};

export type FindUserByIdDTOType = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  isVerified: boolean;
  createdAt: string;
};

export type UpdateUserByIdDTOType = {
  id: string;
  updatedFields: string[];
  updatedAt: string;
};

export type DeleteUserByIdDTOType = {
  id: string;
  deletedAt: string;
};

export type RefreshedUserAccessTokenDTOType = {
  id: string;
  accessToken: string;
  updatedAt: string;
};
