import { Types } from "mongoose";

export type UserCreated = {
  _id: Types.ObjectId;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
};
