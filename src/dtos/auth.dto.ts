import {
  SignedUpUserDTOType,
  VerifiedUserDTOType,
  LoggedInUserDTOType,
  RefreshedUserAccessTokenDTOType,
} from "../types/dto.types";
import { UserType } from "../types/user/user.type";

export class SignedUpUserDTO {
  static toJSON(user: UserType): SignedUpUserDTOType {
    return {
      userId: user._id,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}

export class VerifiedUserDTO {
  static toJSON(user: UserType): VerifiedUserDTOType {
    return {
      userId: user._id,
      isVerified: user.isVerified,
      updatedAt: user.updatedAt,
    };
  }
}

export class LoggedInUserDTO {
  static toJSON(user: UserType & { accessToken: string }): LoggedInUserDTOType {
    return {
      userId: user._id,
      accessToken: user.accessToken,
      lastLogin: user.lastLogin,
      updatedAt: user.updatedAt,
    };
  }
}

export class RefreshedUserAccessTokenDTO {
  static toJSON(
    user: UserType & { accessToken: string }
  ): RefreshedUserAccessTokenDTOType {
    return {
      userId: user._id,
      accessToken: user.accessToken,
      updatedAt: user.updatedAt,
    };
  }
}
