import {
  FindAllDTOType,
  UpdateByIdDTOType,
  DeleteByIdDTOType,
} from "../../types/dto.types";
import { PaginationType } from "../../types/pagination.types";

export class FindAllDTO {
  static toJSON<T extends { _id: string }>(
    documents: T[],
    pagination: PaginationType
  ): FindAllDTOType<T> {
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

    return { pagination, results: documents };
  }
}

export class UpdateByIdDTO {
  static toJSON<T extends { updatedAt: string }, K extends keyof T>(
    resource: T,
    fields?: K[]
  ): UpdateByIdDTOType<Pick<T, K>> {
    const updatedFields: Partial<Pick<T, K>> = {};

    if (fields && fields.length > 0) {
      for (const field of fields) {
        const value = resource[field];

        if (value !== undefined) {
          updatedFields[field] = value;
        }
      }
    }

    return { ...updatedFields, updatedAt: resource.updatedAt };
  }
}

export class DeleteByIdDTO {
  static toJSON<T extends { _id: string }>(resource: T): DeleteByIdDTOType<T> {
    return { _id: resource._id, deletedAt: new Date().toISOString() };
  }
}
