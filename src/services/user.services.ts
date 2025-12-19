import { mongoose } from "../utils/db.utils";
import User from "../models/user.model";
import {
  FindAllUsersReturn,
  FindAllUsersQueryRequest,
  FindUserFilter,
  UpdateUserOptions,
} from "../types/user/services.types";
import {
  BadRequestError,
  ConflictError,
  CustomError,
  InternalServerError,
  NotFoundError,
} from "../config/CustomError";
import { UserType } from "../types/user/user.type";
import { ENV } from "../utils/env.utils";
import { SignUpRequestBody } from "../types/auth/request.types";
import {
  buildQueryFields,
  buildQueryFilters,
  buildQuerySort,
  buildPagination,
  buildUpdateQuery,
} from "../utils/builders.utils";
import { createToken } from "../utils/token.utils";

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
  query: FindAllUsersQueryRequest,
  baseUrl: string
): Promise<FindAllUsersReturn> => {
  const { fields, sort, limit = 10, offset = 0, ...rest } = query;

  try {
    const queryFilters = buildQueryFilters(rest);

    const queryFields = buildQueryFields(fields);

    const sortArray = Array.isArray(sort) ? sort : sort ? [sort] : [];

    const querySort = buildQuerySort(sortArray);

    const documents = await User.find(queryFilters, queryFields)
      .sort(querySort)
      .skip(offset)
      .limit(limit);

    const results = documents.map((doc) => doc.toObject());

    const total = await User.countDocuments(queryFilters);

    const { nextUrl, previousUrl } = buildPagination(
      baseUrl,
      total,
      limit,
      offset,
      query
    );

    return {
      results,
      pagination: { total, limit, offset, nextUrl, previousUrl },
    };
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      throw error;
    }

    throw new InternalServerError(
      "Failed to Find Users",
      "An unexpected error occurred while loading users from the database. Please try again later.",
      "FIND_USERS_DB_ERROR",
      {}
    );
  }
};

export const findUserService = async (
  filter: FindUserFilter,
  selectFields?: string
) => {
  try {
    const document = selectFields
      ? await User.findOne(filter, selectFields)
      : await User.findOne(filter);
    //arrumar aqui o filter para nao expor dados sensiveis
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
  options: UpdateUserOptions,
  session?: mongoose.ClientSession
) => {
  try {
    const updateQuery = buildUpdateQuery(options);

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
    if (error instanceof NotFoundError || error instanceof BadRequestError)
      throw error;

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
