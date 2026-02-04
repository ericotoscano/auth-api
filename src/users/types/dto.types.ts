import { PaginationType } from "./services.types";

export type FindUsersDTO = {
  pagination: PaginationType;
  results: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    createdAt?: string;
    updatedAt?: string;
  }[];
};

export type FindUserByIdDTO = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  isVerified: boolean;
  createdAt: string;
};

export type UpdateUserByIdDTO = {
  id: string;
  updatedAt: string;
};

export type DeleteUserByIdDTO = {
  id: string;
  deletedAt: string;
};
