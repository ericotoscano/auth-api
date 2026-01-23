import { mongoose } from "../infra/db/mongoose";
import User from "./model/user.model";
import {
  BadRequestError,
  ConflictError,
  CustomError,
  InternalServerError,
  NotFoundError,
} from "../errors/custom-error";
import {
  buildQueryFields,
  buildQueryFilters,
  buildQuerySort,
  buildPagination,
  buildUpdateQuery,
} from "./utils";
import { SignUpRequestBody } from "../auth/types/request.types";
import { UserType } from "../shared/types/user.types";
import {
  FindAllUsersQueryRequest,
  FindAllUsersReturn,
  FindUserFilter,
  UpdateUserOptions,
} from "./types/services.types";
import { mapUserDocumentToUser } from "./mappers";
import { UserDocument } from "./model/user.document";

export const createUserService = async (
  signUpBody: SignUpRequestBody,
  session?: mongoose.ClientSession,
): Promise<UserType> => {
  const { firstName, lastName, username, email, password } = signUpBody;

  try {
    const createdUser = await User.create(
      [
        {
          firstName,
          lastName,
          username,
          email,
          password,
        },
      ],
      { session },
    );

    return mapUserDocumentToUser(createdUser[0]);
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      const field = Object.keys(error.keyPattern)[0];

      throw new ConflictError(
        "User Creation Conflict",
        "This username or email is already in use.",
        "USER_CONFLICT",
        { field },
      );
    }

    throw new InternalServerError(
      "User Creation Failed",
      "An unexpected error ocurred while creating user. Please try again later.",
      "USER_CREATE_FAILED",
    );
  }
};

export const findAllUsersService = async (
  query: FindAllUsersQueryRequest,
  baseUrl: string,
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

    const results = documents.map((doc) => mapUserDocumentToUser(doc));

    const total = await User.countDocuments(queryFilters);

    const { nextUrl, previousUrl } = buildPagination(
      baseUrl,
      total,
      limit,
      offset,
      query,
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
      "Failed to Retrieve Users",
      "An unexpected error occurred while loading users from the database. Please try again later.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const findUserService = async (
  filter: FindUserFilter,
): Promise<UserType> => {
  try {
    const document = await User.findOne(filter);

    if (!document) {
      throw new NotFoundError(
        "User Not Found",
        "No user matching the provided criteria was found.",
        `USER_NOT_FOUND`,
      );
    }

    return mapUserDocumentToUser(document);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      "Failed to Retrieve User",
      "An unexpected error occurred while loading requested user. Please try again later.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const findUserDocumentService = async (
  filter: FindUserFilter,
  options?: { select?: string },
): Promise<UserDocument> => {
  try {
    const query = User.findOne(filter);

    if (options?.select) {
      query.select(options.select);
    }

    const document = await query;

    if (!document) {
      throw new NotFoundError(
        "User Not Found",
        "No user matching the provided criteria was found.",
        "USER_NOT_FOUND",
      );
    }

    return document;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      "Failed to Retrieve User",
      "An unexpected error occurred while loading requested user. Please try again later.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const updateUserByIdService = async (
  id: string,
  options: UpdateUserOptions,
  session?: mongoose.ClientSession,
): Promise<UserType> => {
  try {
    const updateQuery = buildUpdateQuery(options);

    if (Object.keys(updateQuery).length === 0) {
      throw new BadRequestError(
        "Invalid Update Payload",
        "At least one field must be provided to update or remove.",
        "INVALID_UPDATE_PAYLOAD",
      );
    }

    const updatedDocument = await User.findByIdAndUpdate(id, updateQuery, {
      new: true,
      session,
    });

    if (!updatedDocument) {
      throw new NotFoundError(
        "User Not Found",
        "No user was found to update.",
        "USER_NOT_FOUND",
      );
    }

    return mapUserDocumentToUser(updatedDocument);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof BadRequestError)
      throw error;

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      const field = Object.keys(error.keyPattern)[0];

      throw new ConflictError(
        "User Update Conflict",
        "Some field provided to update is already in use.",
        "USER_CONFLICT",
        { field },
      );
    }

    throw new InternalServerError(
      "Failed to Update User",
      `An unexpected error occurred while updating the user. Please try again later.`,
      "USER_UPDATE_FAILED",
    );
  }
};

export const deleteUserByIdService = async (
  id: string,
  session?: mongoose.ClientSession,
): Promise<void> => {
  try {
    const deletedDocument = await User.findByIdAndDelete(id, { session });

    if (!deletedDocument) {
      throw new NotFoundError(
        "User Not Found",
        `No user was found to delete.`,
        "USER_NOT_FOUND",
      );
    }

    return;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      "Failed to Delete User",
      "An unexpected error occurred while deleting the user. Please try again later.",
      "SYSTEM_UNEXPECTED",
    );
  }
};
