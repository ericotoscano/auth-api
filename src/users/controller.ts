import { NextFunction, Request } from "express";
import {
  deleteUserByIdService,
  findAllUsersService,
  findUserService,
  updateUserByIdService,
} from "./services";
import { FindUserByIdDTOMapper, FindUsersDTOMapper, UpdateUserByIdDTOMapper } from "./dto";
import { ApiResponse } from "../shared/types/response.types";
import { buildBaseUrl } from "./utils";
import {
  FindUsersQuery,
  UpdateUserRequest,
  UserIdRequest,
} from "./types/request.types";
import {
  FindUserByIdDTO,
  FindUsersDTO,
  UpdateUserByIdDTO,
} from "./types/dto.types";

export const findAllUsers = async (
  req: Request<{}, {}, {}, FindUsersQuery>,
  res: ApiResponse<FindUsersDTO>,
  next: NextFunction,
) => {
  try {
    const baseUrl = buildBaseUrl(req);

    const { results, pagination } = await findAllUsersService(
      req.query,
      baseUrl,
    );

    res.status(200).json({
      success: true,
      message:
        results.length === 0
          ? "No users found matching the provided filters."
          : "Users retrieved successfully.",
      data: FindUsersDTOMapper.toJSON(results, pagination),
    });
  } catch (error) {
    next(error);
  }
};

export const findUserById = async (
  req: Request<UserIdRequest>,
  res: ApiResponse<FindUserByIdDTO>,
  next: NextFunction,
) => {
  const { id } = req.validated!.params as UserIdRequest;

  try {
    const user = await findUserService({ _id: id });

    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: FindUserByIdDTOMapper.toJSON(user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (
  req: Request<UserIdRequest, {}, UpdateUserRequest>,
  res: ApiResponse<UpdateUserByIdDTO>,
  next: NextFunction,
) => {
  const { id } = req.validated!.params as UserIdRequest;
  const updateOptions = req.validated!.body as UpdateUserRequest;

  try {
    const updatedUser = await updateUserByIdService(id, {
      set: updateOptions,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: UpdateUserByIdDTOMapper.toJSON(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (
  req: Request<UserIdRequest>,
  res: ApiResponse<{}>,
  next: NextFunction,
) => {
  const { id } = req.validated!.params as UserIdRequest;

  try {
    await deleteUserByIdService(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
