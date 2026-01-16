import { PaginationType } from "./services.types";

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
