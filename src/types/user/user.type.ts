export type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  verificationToken: string;
  refreshToken: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
};
