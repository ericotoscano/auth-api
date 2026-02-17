import {
  UserForLogin,
  UserLoggedIn,
  UserForVerification,
  UserVerified,
  UserForResetPassword,
  UserForSendEmail,
  UserForAccess,
} from "../auth/types/services.types";
import { UserCreated } from "../shared/types/user.types";
import { UserDocument } from "./model/user.document";
import { UserFoundById, UserUpdatedById } from "./types/services.types";

export class UserMapper {
  static toCreated(user: UserDocument): UserCreated {
    if (!user.username || !user.email || !user.createdAt) {
      throw new Error("Invalid UserDocument for UserCreated");
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified ?? false,
      createdAt: user.createdAt,
    };
  }

  static toForLogin(user: UserDocument): UserForLogin {
    if (!user.username || !user.email || !user.password || !user.updatedAt) {
      throw new Error("Invalid UserDocument for UserForLogin");
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified ?? false,
    };
  }

  static toLoggedIn(user: UserDocument): UserLoggedIn {
    if (!user.updatedAt) {
      throw new Error("Invalid UserDocument for UserLoggedIn");
    }

    return { _id: user._id, updatedAt: user.updatedAt };
  }

  static toForVerification(user: UserDocument): UserForVerification {
    if (!user.verificationToken) {
      throw new Error("Invalid UserDocument for UserForVerification");
    }

    return {
      _id: user._id,
      verificationToken: user.verificationToken,
      isVerified: user.isVerified ?? false,
    };
  }

  static toVerified(user: UserDocument): UserVerified {
    if (!user.updatedAt || !user.isVerified) {
      throw new Error("Invalid UserDocument for UserVerified");
    }

    return { isVerified: user.isVerified, updatedAt: user.updatedAt };
  }

  static toForSendEmail(user: UserDocument): UserForSendEmail {
    if (!user.username) {
      throw new Error("Invalid UserDocument for UserForSendEmail");
    }

    return {
      _id: user._id,
      username: user.username,
      isVerified: user.isVerified ?? false,
    };
  }

  static toForResetPassword(user: UserDocument): UserForResetPassword {
    if (!user.password || !user.password || !user.resetPasswordToken) {
      throw new Error("Invalid UserDocument for UserForResetPassword");
    }

    return {
      _id: user._id,
      password: user.password,
      resetPasswordToken: user.resetPasswordToken,
      isVerified: user.isVerified ?? false,
    };
  }

  static toForAccess(user: UserDocument): UserForAccess {
    if (!user.username || !user.email) {
      throw new Error("Invalid UserDocument for UserForAccess");
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
    };
  }

  static toFoundById(user: UserDocument): UserFoundById {
    if (
      !user.firstName ||
      !user.lastName ||
      !user.username ||
      !user.createdAt ||
      !user.updatedAt
    ) {
      throw new Error("Invalid UserDocument for UserForFoundById");
    }

    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toUpdatedById(user: UserDocument): UserUpdatedById {
    if (!user.updatedAt) {
      throw new Error("Invalid UserDocument for UserForUpdatedById");
    }

    return {
      _id: user._id,
      updatedAt: user.updatedAt,
    };
  }
}
