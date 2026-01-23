import { UserType } from "../shared/types/user.types";
import { UserDocument } from "./model/user.document";

export const mapUserDocumentToUser = (document: UserDocument): UserType => {
  const userObject = document.toObject();

  return {
    _id: userObject._id.toString(),
    firstName: userObject.firstName,
    lastName: userObject.lastName,
    username: userObject.username,
    email: userObject.email,
    isVerified: userObject.isVerified,
    lastLogin: userObject.lastLogin?.toISOString(),
    createdAt: userObject.createdAt.toISOString(),
    updatedAt: userObject.updatedAt.toISOString(),
  };
};
