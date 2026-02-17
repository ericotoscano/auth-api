import { Types } from "mongoose";
import {
  AllowedUsersQueryFields,
  AllowedUsersQuerySort,
} from "../constants/user.constants";

export type UserProjection = {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  username?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FindUsersQuery = {
  fields?: AllowedUsersQueryFields[];
  sort?: AllowedUsersQuerySort[];
  limit?: number;
  offset?: number;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
  nextUrl: string | null;
  previousUrl: string | null;
};

export type UsersPage = {
  results: UserProjection[];
  pagination: Pagination;
};

export type UserFilter = {
  _id?: string;
  username?: string;
  email?: string;
};

export type UserFoundById = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserUpdatedById = {
  _id: Types.ObjectId;
  updatedAt: Date;
};

export type UserUpdateByIdOptions = {
  set: { firstName?: string; lastName?: string; username?: string };
};

export type UserDocumentUpdateOptions = {
  set?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    isVerified?: boolean;
    password?: string;
    resetPasswordToken?: string;
    verificationToken?: string;
    refreshToken?: string;
    lastLogin?: string;
  };
  unset?: ("verificationToken" | "resetPasswordToken" | "refreshToken")[];
};
