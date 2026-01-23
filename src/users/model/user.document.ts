import { Document, Types } from "mongoose";

export type UserDocument = Document & {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  verificationToken?: string;
  refreshToken?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
};
