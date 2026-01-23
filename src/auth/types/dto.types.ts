export type SignedUpUserDTOType = {
  isVerified: boolean;
  createdAt: string;
};

export type VerifiedUserDTOType = {
  isVerified: boolean;
  updatedAt: string;
};

export type LoggedInUserDTOType = {
  id: string;
  accessToken: string;
  lastLogin: string;
};

export type RefreshedUserAccessTokenDTOType = {
  accessToken: string;
  updatedAt: string;
};
