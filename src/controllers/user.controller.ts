import { NextFunction, Request } from "express";
import {
  deleteUserByIdService,
  findAllUsersService,
  findUserService,
  updateUserByIdService,
} from "../services/user.services";
import {
  UserIdRequest,
  UpdateUserRequestBody,
} from "../types/users/request.types";
import {
  FindAllUsersDTO,
  FindUserByIdDTO,
  UpdateUserByIdDTO,
} from "../dtos/user.dto";
import { FindAllUsersQueryRequest } from "../types/users/services.types";
import { TypedResponse } from "../types/response.types";
import {
  FindAllUsersDTOType,
  FindUserByIdDTOType,
  UpdateUserByIdDTOType,
} from "../types/dto.types";
import { buildBaseUrl } from "../utils/builders.utils";

export const findAllUsers = async (
  req: Request<{}, {}, {}, FindAllUsersQueryRequest>,
  res: TypedResponse<FindAllUsersDTOType>,
  next: NextFunction
) => {
  try {
    const baseUrl = buildBaseUrl(req);

    const { results, pagination } = await findAllUsersService(
      req.query,
      baseUrl
    );

    res.status(200).json({
      success: true,
      message:
        results.length === 0
          ? "No users found matching the provided filters."
          : "Users retrieved successfully.",
      data: FindAllUsersDTO.toJSON(results, pagination),
    });
  } catch (error) {
    next(error);
  }
};

export const findUserById = async (
  req: Request<UserIdRequest>,
  res: TypedResponse<FindUserByIdDTOType>,
  next: NextFunction
) => {
  const { id } = req.validated!.params as UserIdRequest;

  try {
    const user = await findUserService({ _id: id });

    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: FindUserByIdDTO.toJSON(user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (
  req: Request<UserIdRequest, {}, UpdateUserRequestBody>,
  res: TypedResponse<UpdateUserByIdDTOType>,
  next: NextFunction
) => {
  const { id } = req.validated!.params as UserIdRequest;
  const updateOptions = req.validated!.body as UpdateUserRequestBody;

  try {
    const updatedUser = await updateUserByIdService(id, {
      set: updateOptions,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: UpdateUserByIdDTO.toJSON(updatedUser, updateOptions),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (
  req: Request<UserIdRequest>,
  res: TypedResponse<{}>,
  next: NextFunction
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
