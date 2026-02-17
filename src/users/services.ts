import { mongoose } from "../infra/db/mongoose";
import User from "./model/user.model";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../errors/custom-error";
import {
  buildQueryFields,
  buildQueryFilters,
  buildQuerySort,
  buildPagination,
  buildUserDocumentUpdateQuery,
  buildUserUpdateByIdQuery,
} from "./utils";
import { SignUpRequest } from "../auth/types/request.types";
import {
  UsersPage,
  UserFilter,
  UserDocumentUpdateOptions,
  FindUsersQuery,
  UserProjection,
  UserFoundById,
  UserUpdateByIdOptions,
  UserUpdatedById,
} from "./types/services.types";
import { UserMapper } from "./mapper";
import { UserDocument } from "./model/user.document";
import { UserCreated } from "../shared/types/user.types";
import { Types } from "mongoose";
import { logger } from "../infra/logger/logger";

export const createUserService = async (
  signUpBody: SignUpRequest,
  session?: mongoose.ClientSession,
): Promise<UserCreated> => {
  const { firstName, lastName, username, email, password } = signUpBody;

  try {
    const userCreated = await User.create(
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

    return UserMapper.toCreated(userCreated[0]);
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

export const findUsersService = async (
  query: FindUsersQuery,
  baseUrl: string,
  originalQuery: Record<string, any>,
): Promise<UsersPage> => {
  const { fields, sort, limit = 10, offset = 0, ...filters } = query;

  try {
    const filterQuery = buildQueryFilters(filters);
    const selectFields = buildQueryFields(fields);
    const sortQuery = buildQuerySort(sort);

    const [results, total] = await Promise.all([
      User.find(filterQuery)
        .select(selectFields)
        .sort(sortQuery)
        .skip(offset)
        .limit(limit)
        .lean<UserProjection[]>(),
      User.countDocuments(filterQuery),
    ]);

    const { nextUrl, previousUrl } = buildPagination(
      baseUrl,
      total,
      limit,
      offset,
      originalQuery,
    );

    return {
      results,
      pagination: { total, limit, offset, nextUrl, previousUrl },
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message, { stack: error.stack });
    }
    throw new InternalServerError(
      "Failed to Retrieve Users",
      "An unexpected error occurred while loading users from the database.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const findUserByIdService = async (
  id: string,
): Promise<UserFoundById> => {
  try {
    const userDoc = await User.findById(id);

    if (!userDoc) {
      throw new NotFoundError(
        "User Not Found",
        "No user matching the provided ID was found.",
        "USER_NOT_FOUND",
      );
    }

    const userFoundById = UserMapper.toFoundById(userDoc);

    return userFoundById;
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
  options: UserUpdateByIdOptions,
): Promise<UserUpdatedById> => {
  try {
    const userUpdateQuery = buildUserUpdateByIdQuery(options);

    if (Object.keys(userUpdateQuery).length === 0) {
      throw new BadRequestError(
        "Invalid Update Payload",
        "At least one field must be provided to update or remove.",
        "INVALID_UPDATE_PAYLOAD",
      );
    }

    const userDoc = await User.findByIdAndUpdate(id, userUpdateQuery, {
      new: true,
      runValidators: true,
    });

    if (!userDoc) {
      throw new NotFoundError(
        "User Not Found",
        "No user was found to update.",
        "USER_NOT_FOUND",
      );
    }

    const userUpdatedById = UserMapper.toUpdatedById(userDoc);

    return userUpdatedById;
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

export const findUserDocumentService = async (
  filter: UserFilter,
  options?: { select?: string },
): Promise<UserDocument> => {
  try {
    const query = User.findOne(filter);

    if (options?.select) {
      query.select(options.select);
    }

    const userDoc = await query;

    if (!userDoc) {
      throw new NotFoundError(
        "User Not Found",
        "No user matching the provided criteria was found.",
        "USER_NOT_FOUND",
      );
    }

    return userDoc;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;

    throw new InternalServerError(
      "Failed to Retrieve User",
      "An unexpected error occurred while loading requested user. Please try again later.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export const updateUserDocumentByIdService = async (
  id: string | Types.ObjectId,
  options: UserDocumentUpdateOptions,
  session?: mongoose.ClientSession,
): Promise<UserDocument> => {
  try {
    const userDocUpdateQuery = buildUserDocumentUpdateQuery(options);

    if (Object.keys(userDocUpdateQuery).length === 0) {
      throw new BadRequestError(
        "Invalid Update Payload",
        "At least one field must be provided to update or remove.",
        "INVALID_UPDATE_PAYLOAD",
      );
    }

    const updatedUserDoc = await User.findByIdAndUpdate(
      id,
      userDocUpdateQuery,
      {
        new: true,
        session,
      },
    );

    if (!updatedUserDoc) {
      throw new NotFoundError(
        "User Not Found",
        "No user was found to update.",
        "USER_NOT_FOUND",
      );
    }

    return updatedUserDoc;
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
    const userDoc = await User.findByIdAndDelete(id, { session });

    if (!userDoc) {
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
