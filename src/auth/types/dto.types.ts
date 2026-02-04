export type UserSignedUpDTO = {
  isVerified: boolean;
  createdAt: string;
};

export type UserSessionDTO = {
  id: string;
  accessToken: string;
  lastLogin: string;
};

export type UserVerifiedDTO = {
  isVerified: boolean;
  updatedAt: string;
};

export type AccessTokenRefreshedDTO = {
  accessToken: string;
  updatedAt: string;
};
