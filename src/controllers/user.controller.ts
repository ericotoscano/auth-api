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
} from "../types/user/request.types";
import { UserType } from "../types/user/user.type";
import { FindUserByIdDTO } from "../dtos/user.dto";
import { FindAllQueryRequest } from "../types/services.types";
import { AllowedUsersFiltersParams } from "../types/user/constants.types";
import { DeleteByIdDTO, FindAllDTO, UpdateByIdDTO } from "../dtos/generic.dto";
import { TypedResponse } from "../types/response.types";
import {
  FindAllDTOType,
  FindUserByIdDTOType,
  UpdateByIdDTOType,
  DeleteByIdDTOType,
} from "../types/dto.types";
import { buildBaseUrl } from "../utils/builder.utils";

export const findAllUsers = async (
  req: Request<{}, {}, {}, FindAllQueryRequest<AllowedUsersFiltersParams>>,
  res: TypedResponse<FindAllDTOType<UserType>>,
  next: NextFunction
) => {
  try {
    const baseUrl = buildBaseUrl(req);

    const { documents, pagination } = await findAllUsersService(
      req.query,
      baseUrl
    );

    res.status(200).json({
      success: true,
      message:
        documents.length === 0
          ? "No users found matching the provided filters."
          : "Users retrieved successfully.",
      data: FindAllDTO.toJSON(documents, pagination),
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
  const { userId } = req.params;

  try {
    const user = await findUserService({ _id: userId });

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
  res: TypedResponse<UpdateByIdDTOType<UserType>>,
  next: NextFunction
) => {
  const { userId } = req.params;
  const updateUserOptions = req.body;

  try {
    const updatedUser = await updateUserByIdService(userId, {
      set: updateUserOptions,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: UpdateByIdDTO.toJSON(
        updatedUser,
        Object.keys(updateUserOptions) as (keyof UserType)[]
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (
  req: Request<UserIdRequest>,
  res: TypedResponse<DeleteByIdDTOType<UserType>>,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const deletedUser = await deleteUserByIdService(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: DeleteByIdDTO.toJSON(deletedUser),
    });
  } catch (error) {
    next(error);
  }
};
