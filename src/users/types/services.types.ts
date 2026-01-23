import { UserType } from "../../shared/types/user.types";

export type PaginationType = {
  total: number;
  limit: number;
  offset: number;
  nextUrl: string | null;
  previousUrl: string | null;
};

export type FindAllUsersQueryRequest = {
  fields?: string[];
  sort?: string;
  limit?: number;
  offset?: number;
  fist_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type FindAllUsersReturn = {
  results: UserType[];
  pagination: PaginationType;
};

export type FindUserFilter = {
  _id?: string;
  username?: string;
  email?: string;
};

export type UpdateUserOptions = {
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
