import { NextFunction, Request } from "express";
import {
  deleteUserByIdService,
  findUserByIdService,
  findUsersService,
  updateUserByIdService,
} from "./services";
import {
  FindUserByIdDTOMapper,
  FindUsersDTOMapper,
  UpdateUserByIdDTOMapper,
} from "./dto";
import { ApiResponse } from "../shared/types/response.types";
import { buildBaseUrl } from "./utils";
import {
  FindUsersQueryRequest,
  UpdateUserByIdRequest,
  UserByIdRequest,
} from "./types/request.types";
import {
  FindUserByIdDTO,
  FindUsersDTO,
  UpdateUserByIdDTO,
} from "./types/dto.types";
import { FindUsersQuery, UserUpdateByIdOptions } from "./types/services.types";

export const findUsers = async (
  req: Request<{}, {}, {}, FindUsersQueryRequest>,
  res: ApiResponse<FindUsersDTO>,
  next: NextFunction,
) => {
  try {
    const baseUrl = buildBaseUrl(req);

    const filters = req.validated!.query as FindUsersQuery;

    const { results, pagination } = await findUsersService(
      filters,
      baseUrl,
      req.query,
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
  req: Request<UserByIdRequest>,
  res: ApiResponse<FindUserByIdDTO>,
  next: NextFunction,
) => {
  const { id } = req.validated!.params as UserByIdRequest;

  try {
    const userFoundById = await findUserByIdService(id);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: FindUserByIdDTOMapper.toJSON(userFoundById),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (
  req: Request<UserByIdRequest, {}, UpdateUserByIdRequest>,
  res: ApiResponse<UpdateUserByIdDTO>,
  next: NextFunction,
) => {
  const { id } = req.validated!.params as UserByIdRequest;
  const userUpdateOptions = req.validated!.body as UpdateUserByIdRequest;

  try {
    const userUpdatedById = await updateUserByIdService(id, {
      set: userUpdateOptions,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: UpdateUserByIdDTOMapper.toJSON(userUpdatedById),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (
  req: Request<UserByIdRequest>,
  res: ApiResponse<{}>,
  next: NextFunction,
) => {
  const { id } = req.validated!.params as UserByIdRequest;

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
