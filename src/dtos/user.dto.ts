import {
  FindAllUsersDTOType,
  FindUserByIdDTOType,
  UpdateUserByIdDTOType,
} from "../types/dto.types";
import { PaginationType } from "../types/pagination.types";
import { UpdateUserFields } from "../types/user/services.types";
import { UserType } from "../types/user/user.type";

export class FindAllUsersDTO {
  static toJSON(
    documents: UserType[],
    pagination: PaginationType
  ): FindAllUsersDTOType {
    const results = documents.map((doc) => {
      return {
        id: doc._id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        username: doc.username,
        createdAt: doc.createdAt,
      };
    });

    return {
      pagination,
      results,
    };
  }
}

export class FindUserByIdDTO {
  static toJSON(user: UserType): FindUserByIdDTOType {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}

export class UpdateUserByIdDTO {
  static toJSON(
    user: UserType,
    fields: UpdateUserFields
  ): UpdateUserByIdDTOType {
    return {
      id: user._id,
      updatedFields: Object.keys(fields),
      updatedAt: user.updatedAt,
    };
  }
}
