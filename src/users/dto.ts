import {
  FindUserByIdDTO,
  FindUsersDTO,
  UpdateUserByIdDTO,
} from "./types/dto.types";
import { Pagination } from "./types/services.types";

export class FindUsersDTOMapper {
  static toJSON(documents: UserType[], pagination: Pagination): FindUsersDTO {
    const results = documents.map((doc) => {
      return {
        id: doc._id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        username: doc.username,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    return {
      pagination,
      results,
    };
  }
}

export class FindUserByIdDTOMapper {
  static toJSON(user: UserType): FindUserByIdDTO {
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

export class UpdateUserByIdDTOMapper {
  static toJSON(user: UserType): UpdateUserByIdDTO {
    return {
      id: user._id,
      updatedAt: user.updatedAt,
    };
  }
}
