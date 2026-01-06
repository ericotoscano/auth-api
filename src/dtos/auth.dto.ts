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
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}

export class VerifiedUserDTO {
  static toJSON(user: UserType): VerifiedUserDTOType {
    return {
      isVerified: user.isVerified,
      updatedAt: user.updatedAt,
    };
  }
}

export class LoggedInUserDTO {
  static toJSON(user: UserType, accessToken: string): LoggedInUserDTOType {
    return {
      id: user._id,
      accessToken,
      lastLogin: user.lastLogin,
      updatedAt: user.updatedAt,
    };
  }
}

export class RefreshedUserAccessTokenDTO {
  static toJSON(
    user: UserType,
    accessToken: string
  ): RefreshedUserAccessTokenDTOType {
    return {
      accessToken,
      updatedAt: user.updatedAt,
    };
  }
}
