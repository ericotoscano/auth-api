import { Request } from "express";
import { mongoose } from "../../src/utils/db.utils";
import { FilterQuery, HydratedDocument, Model } from "mongoose";
import {
  NotFoundError,
  InternalServerError,
  BadRequestError,
  ConflictError,
} from "../config/CustomError";
import { FindAllQueryRequest, UpdateOptions } from "../types/services.types";
import { buildUpdateQuery } from "./query.utils";
import {
  buildAllowedFields,
  buildPagination,
  buildAllowedFilters,
  buildAllowedSort,
} from "./params.utils";
import { PaginationType } from "../types/pagination.types";

export const getBaseUrlFromRequest = <Q>(
  req: Request<{}, {}, {}, Q>
): string => {
  return `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
};

export const findAll = async <
  M,
  F extends string,
  FD extends string,
  S extends string
>(
  model: Model<M>,
  query: FindAllQueryRequest<F>,
  baseUrl: string,
  allowedFiltersParams: readonly F[],
  allowedFieldsParams: readonly FD[],
  allowedSortParams: readonly S[]
): Promise<{
  documents: HydratedDocument<M>[];
  pagination: PaginationType;
}> => {
  const { fields, sort, limit = 10, offset = 0, ...rest } = query;

  try {
    const queryFilters = buildAllowedFilters(
      allowedFiltersParams,
      rest
    ) as FilterQuery<M>;

    const queryFields = buildAllowedFields(allowedFieldsParams, fields);

    const sortArray = Array.isArray(sort) ? sort : sort ? [sort] : [];

    const querySort = buildAllowedSort(allowedSortParams, sortArray);

    const documents = await model
      .find(queryFilters, queryFields)
      .sort(querySort)
      .skip(offset)
      .limit(limit);

    const total = await model.countDocuments(queryFilters);

    const { nextUrl, previousUrl } = buildPagination(
      baseUrl,
      total,
      limit,
      offset,
      query
    );

    return {
      documents,
      pagination: { total, limit, offset, nextUrl, previousUrl },
    };
  } catch (error: unknown) {
    const pluralModelName = model.collection.collectionName;

    if (error instanceof mongoose.Error.ValidationError) {
      throw new BadRequestError(
        `Invalid ${pluralModelName} Query`,
        `One or more query parameters are invalid or not allowed for ${pluralModelName.toLowerCase()}.`,
        "FIND_ALL_QUERY_INVALID"
      );
    }

    throw new InternalServerError(
      `Failed to Retrieve ${pluralModelName}`,
      `An unexpected error occurred while loading ${pluralModelName.toLowerCase()} from the database. Please try again later.`,
      "FIND_ALL_DB_ERROR"
    );
  }
};

export const findOne = async <T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  selectFields?: string
): Promise<T> => {
  const modelName = model.modelName;

  try {
    const document = selectFields
      ? await model.findOne(filter, selectFields)
      : await model.findOne(filter);

    if (!document) {
      throw new NotFoundError(
        `${modelName} Not Found`,
        `No ${modelName.toLowerCase()} matching the provided filter was found in the database.`,
        `FIND_ONE_${modelName.toUpperCase()}_NOT_FOUND`
      );
    }

    return document.toObject() as T;
  } catch (error: unknown) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      `Failed to Retrieve ${modelName}`,
      `An unexpected error occurred while loading ${modelName.toLowerCase()} from the database. Please try again later.`,
      "FIND_ONE_DB_ERROR"
    );
  }
};

export const updateById = async <T, U extends Record<string, any>>(
  model: Model<T>,
  id: string,
  options: UpdateOptions<U>,
  session?: mongoose.ClientSession
): Promise<T> => {
  const modelName = model.modelName;

  try {
    const updateQuery = buildUpdateQuery(options);

    const updatedDocument = await model.findByIdAndUpdate(id, updateQuery, {
      new: true,
      session,
    });

    if (!updatedDocument) {
      throw new NotFoundError(
        `${modelName} Not Found`,
        `No ${modelName.toLowerCase()} with id ${id} was found to update.`,
        `UPDATE_BY_ID_${modelName.toUpperCase()}_NOT_FOUND`
      );
    }

    return updatedDocument.toObject() as T;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    if (error instanceof mongoose.mongo.MongoError && error.code === 11000) {
      const field = Object.keys((error as any).keyPattern || {})[0] ?? "field";

      throw new ConflictError(
        `${modelName} Conflict`,
        `The ${field} has already been used. Please choose another one.`,
        `UPDATE_BY_ID_${modelName.toUpperCase()}_CONFLICT`
      );
    }

    throw new InternalServerError(
      `Failed to Update ${modelName}`,
      `An unexpected error occurred while updating ${modelName.toLowerCase()} in the database. Please try again later.`,
      "UPDATE_BY_ID_DB_ERROR"
    );
  }
};

export const deleteById = async <T>(
  model: Model<T>,
  id: string,
  session?: mongoose.ClientSession
): Promise<T> => {
  const modelName = model.modelName;

  try {
    const deletedDocument = await model.findByIdAndDelete(id, { session });

    if (!deletedDocument) {
      throw new NotFoundError(
        `${modelName} Not Found`,
        `No ${modelName.toLowerCase()} with id ${id} was found to delete.`,
        `DELETE_BY_ID_${modelName.toUpperCase()}_NOT_FOUND`
      );
    }

    return deletedDocument.toObject() as T;
  } catch (error: unknown) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      `Failed to Delete ${modelName}`,
      `An unexpected error occurred while deleting ${modelName.toLowerCase()} in the database. Please try again later.`,
      "DELETE_BY_ID_DB_ERROR"
    );
  }
};
