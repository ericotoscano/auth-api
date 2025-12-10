import { mongoose } from "../utils/db.utils";
import User from "../models/user.model";
import {
  FindUserFilters,
  UserUpdateFields,
} from "../types/user/services.types";
import { FindAllQueryRequest, UpdateOptions } from "../types/services.types";
import { AllowedUsersFiltersParams } from "../types/user/constants.types";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../config/CustomError";
import { UserType } from "../types/user/user.type";
import { ENV } from "../utils/env.utils";
import { SignUpRequestBody } from "../types/auth/request.types";
import {
  buildAllowedFields,
  buildAllowedFilters,
  buildAllowedSort,
  buildPagination,
  buildUpdateQuery,
} from "../utils/builder.utils";
import { createToken } from "../utils/token.utils";
import { FilterQuery } from "mongoose";

export const createUserService = async (
  signUpBody: SignUpRequestBody
): Promise<UserType> => {
  const { firstName, lastName, username, email, password } = signUpBody;

  try {
    const verificationToken = createToken(
      { username },
      {
        secret: ENV.VERIFICATION_TOKEN_SECRET_KEY,
        expiresInMinutes: Number(ENV.VERIFICATION_TOKEN_DURATION_MINUTES),
        audience: "urn:jwt:type:verification",
        issuer: "urn:system:token-issuer:type:verification",
      }
    );

    const createdUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      verificationToken,
    });

    return createdUser;
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new ConflictError(
        "User Creation Conflict",
        "This username or email is already in use.",
        "USER_CONFLICT_ERROR",
        error.keyValue
      );
    }

    throw new InternalServerError(
      "User Creation Failed",
      "An unexpected error ocurred while creating user. Please try again later.",
      "CREATE_USER_ERROR",
      {}
    );
  }
};

export const findAllUsersService = async (
  queryRequest: FindAllQueryRequest<AllowedUsersFiltersParams>,
  baseUrl: string
) => {
  const { fields, sort, limit = 10, offset = 0, ...rest } = queryRequest;

  try {
    const queryFilters = buildAllowedFilters(rest) as FilterQuery<UserType>;

    const queryFields = buildAllowedFields(fields);

    const sortArray = Array.isArray(sort) ? sort : sort ? [sort] : [];

    const querySort = buildAllowedSort(sortArray);

    const documents = await User.find(queryFilters, queryFields)
      .sort(querySort)
      .skip(offset)
      .limit(limit);

    const total = await User.countDocuments(queryFilters);

    const { nextUrl, previousUrl } = buildPagination(
      baseUrl,
      total,
      limit,
      offset,
      queryRequest
    );

    return {
      documents,
      pagination: { total, limit, offset, nextUrl, previousUrl },
    };
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new BadRequestError(
        "Invalid Users Query",
        "One or more query parameters are invalid or not allowed for users.",
        "USERS_QUERY_ERROR",
        {}
      );
    }

    throw new InternalServerError(
      "Failed to Retrieve Users",
      "An unexpected error occurred while loading users from the database. Please try again later.",
      "FIND_USERS_DB_ERROR",
      {}
    );
  }
};

export const findUserService = async (
  filter: FindUserFilters,
  selectFields?: string
) => {
  try {
    const document = selectFields
      ? await User.findOne(filter, selectFields)
      : await User.findOne(filter);

    if (!document) {
      throw new NotFoundError(
        "User Not Found",
        "No user matching the provided filter was found in the database.",
        `USER_NOT_FOUND_ERROR`,
        filter
      );
    }

    return document.toObject() as UserType;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      "Failed to Retrieve User",
      "An unexpected error occurred while loading requested user from the database. Please try again later.",
      "FIND_USER_DB_ERROR",
      {}
    );
  }
};

export const updateUserByIdService = async (
  id: string,
  options: UpdateOptions<UserUpdateFields>,
  session?: mongoose.ClientSession
) => {
  const updateQuery = buildUpdateQuery(options);

  try {
    const updatedDocument = await User.findByIdAndUpdate(id, updateQuery, {
      new: true,
      session,
    });

    if (!updatedDocument) {
      throw new NotFoundError(
        "User Not Found",
        `No user with id ${id} was found to update.`,
        "USER_NOT_FOUND_ERROR",
        { userId: id }
      );
    }

    return updatedDocument.toObject() as UserType;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new ConflictError(
        "User Update Conflict",
        "Some field provided to update is already in use.",
        "USER_CONFLICT_ERROR",
        error.keyValue
      );
    }

    throw new InternalServerError(
      "Failed to Update User",
      `An unexpected error occurred while updating user in the database. Please try again later.`,
      "UPDATE_USER_DB_ERROR",
      {}
    );
  }
};

export const deleteUserByIdService = async (
  id: string,
  session?: mongoose.ClientSession
) => {
  try {
    const deletedDocument = await User.findByIdAndDelete(id, { session });

    if (!deletedDocument) {
      throw new NotFoundError(
        "User Not Found",
        `No user with id ${id} was found to delete.`,
        "USER_NOT_FOUND_ERROR",
        { userId: id }
      );
    }

    return deletedDocument.toObject() as UserType;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      "Failed to Delete User",
      "An unexpected error occurred while deleting user in the database. Please try again later.",
      "DELETE_USER_DB_ERROR",
      {}
    );
  }
};
