export type Pagination = {
  total: number;
  limit: number;
  offset: number;
  nextUrl: string | null;
  previousUrl: string | null;
};

export type UsersPage = {
  results: UserType[];
  pagination: Pagination;
};

export type UserFilter = {
  _id?: string;
  username?: string;
  email?: string;
};

export type UserUpdateOptions = {
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
