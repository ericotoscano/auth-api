import {
  FindUserByIdDTO,
  FindUsersDTO,
  UpdateUserByIdDTO,
} from "./types/dto.types";
import {
  Pagination,
  UserFoundById,
  UserProjection,
  UserUpdatedById,
} from "./types/services.types";

export class FindUsersDTOMapper {
  static toJSON(users: UserProjection[], pagination: Pagination): FindUsersDTO {
    const results = users.map((user) => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    }));

    return {
      pagination,
      results,
    };
  }
}

export class FindUserByIdDTOMapper {
  static toJSON(user: UserFoundById): FindUserByIdDTO {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export class UpdateUserByIdDTOMapper {
  static toJSON(user: UserUpdatedById): UpdateUserByIdDTO {
    return {
      id: user._id.toString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
