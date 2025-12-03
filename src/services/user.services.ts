import { mongoose } from "../utils/db.utils";
import User from "../models/user.model";
import {
  FindUserFilters,
  UserUpdateFields,
} from "../types/user/services.types";
import { FindAllQueryRequest, UpdateOptions } from "../types/services.types";
import { findOne, updateById, deleteById, findAll } from "../utils/crud.utils";
import {
  AllowedUsersFieldsParams,
  AllowedUsersFiltersParams,
  AllowedUsersSortParams,
  allowedUsersFieldsParams,
  allowedUsersFiltersParams,
  allowedUsersSortParams,
} from "../types/user/constants.types";
import { ConflictError, InternalServerError } from "../config/CustomError";
import { UserType } from "../types/user/user.type";
import { createToken } from "../utils/auth.utils";
import { ENV } from "../utils/env.utils";
import { SignUpRequestBody } from "../types/auth/request.types";

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

export const findAllUsersService = (
  queryRequest: FindAllQueryRequest<AllowedUsersFiltersParams>,
  baseUrl: string
) =>
  findAll<
    UserType,
    AllowedUsersFiltersParams,
    AllowedUsersFieldsParams,
    AllowedUsersSortParams
  >(
    User,
    queryRequest,
    baseUrl,
    allowedUsersFiltersParams,
    allowedUsersFieldsParams,
    allowedUsersSortParams
  );

export const findUserService = (
  filter: FindUserFilters,
  selectFields?: string
) => findOne<UserType>(User, filter, selectFields);

export const updateUserByIdService = (
  id: string,
  options: UpdateOptions<UserUpdateFields>,
  session?: mongoose.ClientSession
) => updateById<UserType, UserUpdateFields>(User, id, options, session);

export const deleteUserByIdService = (
  id: string,
  session?: mongoose.ClientSession
) => deleteById<UserType>(User, id, session);
