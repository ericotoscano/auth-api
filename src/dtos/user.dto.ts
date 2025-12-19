import {
  DeleteUserByIdDTOType,
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
    const { limit, offset } = pagination;

    if (!documents || documents.length === 0) {
      return {
        pagination: {
          total: 0,
          limit,
          offset,
          nextUrl: null,
          previousUrl: null,
        },
        results: [],
      };
    }

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
    const updatedFields: string[] = [];

    if (!fields || Object.keys(fields).length === 0) {
      return { id: user._id, updatedFields: [], updatedAt: user.updatedAt };
    }

    for (const field in fields) {
      updatedFields.push(field);
    }

    return { id: user._id, updatedFields, updatedAt: user.updatedAt };
  }
}

export class DeleteUserByIdDTO {
  static toJSON(user: UserType): DeleteUserByIdDTOType {
    return { id: user._id, deletedAt: new Date().toISOString() };
  }
}
