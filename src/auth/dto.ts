import { UserCreated } from "../shared/types/user.types";
import {
  AccessTokenRefreshedDTO,
  UserSessionDTO,
  UserSignedUpDTO,
  UserVerifiedDTO,
} from "./types/dto.types";
import { UserLoggedIn, UserVerified } from "./types/services.types";

export class UserSignedUpDTOMapper {
  static toJSON(user: UserCreated): UserSignedUpDTO {
    return {
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export class UserSessionDTOMapper {
  static toJSON(user: UserLoggedIn, accessToken: string): UserSessionDTO {
    return {
      id: user._id.toString(),
      accessToken,
      lastLogin: user.updatedAt.toISOString(),
    };
  }
}

export class UserVerifiedDTOMapper {
  static toJSON(user: UserVerified): UserVerifiedDTO {
    return {
      isVerified: user.isVerified,
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export class AccessTokenRefreshedDTOMapper {
  static toJSON(
    user: UserLoggedIn,
    accessToken: string,
  ): AccessTokenRefreshedDTO {
    return {
      accessToken,
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
