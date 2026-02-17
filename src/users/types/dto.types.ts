import { Pagination } from "./services.types";

export type FindUsersDTO = {
  pagination: Pagination;
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
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserByIdDTO = {
  id: string;
  updatedAt: string;
};

export type DeleteUserByIdDTO = {
  id: string;
  deletedAt: string;
};
