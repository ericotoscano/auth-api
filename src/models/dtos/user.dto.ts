import { FindUserByIdDTOType } from "../../types/dto.types";
import { UserType } from "../../types/user/user.type";

export class FindUserByIdDTO {
  static toJSON(user: UserType): FindUserByIdDTOType {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isAdmOf: user.isAdmOf,
      isDriverOf: user.isDriverOf,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
