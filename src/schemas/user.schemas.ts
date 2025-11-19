import { z } from "zod";
import {
  allowedUpdateUserFields,
  allowedUsersFieldsParams,
  AllowedUsersFieldsParams,
  allowedUsersSortParams,
  AllowedUsersSortParams,
} from "../types/user/constants.types";
import { isAllowedParams } from "../utils/params.utils";

export const findAllUsersSchema = z
  .object({
    fields: z
      .string({
        invalid_type_error: '"fields" query parameter must be a string.',
      })
      .regex(/^(\w+)(,\w+)*$/, {
        message:
          'Invalid "fields" format. Expected comma-separated list of field names.',
      })
      .optional()
      .refine(
        (data) => {
          if (!data) return true;
          const fieldsParams = data.split(",");
          return fieldsParams.every((field) =>
            isAllowedParams(field, allowedUsersFieldsParams)
          );
        },
        {
          message: `Invalid "fields" query parameter. Allowed fields: ${allowedUsersFieldsParams.join(
            ", "
          )}.`,
        }
      )
      .transform((data) =>
        data ? (data.split(",") as AllowedUsersFieldsParams[]) : undefined
      ),

    sort: z
      .string({
        invalid_type_error: '"sort" query parameter must be a string.',
      })
      .regex(/^(-?\w+)(,-?\w+)*$/, {
        message:
          'Invalid "sort" format. Expected comma-separated field names with optional "-" prefix.',
      })
      .optional()
      .refine(
        (data) => {
          if (!data) return true;
          const sortParams = data.split(",");
          return sortParams.every((sort) =>
            isAllowedParams(sort, allowedUsersSortParams)
          );
        },
        {
          message: `Invalid "sort" query parameter. Allowed sort: ${allowedUsersSortParams.join(
            ", "
          )}.`,
        }
      )
      .transform((data) =>
        data ? (data.split(",") as AllowedUsersSortParams[]) : undefined
      ),

    limit: z.coerce.number().int().positive().optional(),
    offset: z.coerce.number().int().nonnegative().optional(),

    firstName: z
      .string({
        invalid_type_error: '"firstName" query parameter must be a string.',
      })
      .optional()
      .transform((data) => (data?.trim() === "" ? undefined : data)),

    lastName: z
      .string({
        invalid_type_error: '"lastName" query parameter must be a string.',
      })
      .optional(),

    createdAt: z
      .string({
        invalid_type_error: '"createdAt" query parameter must be a string.',
      })
      .optional()
      .refine((data) => data === undefined || !isNaN(Date.parse(data)), {
        message: '"createdAt" must be a valid ISO date string.',
      })
      .transform((data) => (data ? new Date(data) : undefined)),

    updatedAt: z
      .string({
        invalid_type_error: '"updatedAt" query parameter must be a string.',
      })
      .optional()
      .refine((data) => data === undefined || !isNaN(Date.parse(data)), {
        message: '"updatedAt" must be a valid ISO date string.',
      })
      .transform((data) => (data ? new Date(data) : undefined)),
  })
  .strict();

export const updateUserSchema = z
  .object({
    firstName: z
      .string({
        invalid_type_error: "First name must be a string.",
      })
      .trim()
      .min(2, {
        message: "First name must be at least 2 characters long.",
      })
      .max(20, {
        message: "First name must be no longer than 20 characters.",
      })
      .optional(),

    lastName: z
      .string({
        invalid_type_error: "Last name must be a string.",
      })
      .trim()
      .min(2, {
        message: "Last name must be at least 2 characters long.",
      })
      .max(20, {
        message: "Last name must be no longer than 20 characters.",
      })
      .optional(),

    username: z
      .string({
        invalid_type_error: "Username must be a string.",
      })
      .trim()
      .min(3, {
        message: "Username must be at least 3 characters long.",
      })
      .max(8, {
        message: "Username must be no longer than 8 characters.",
      })
      .optional(),

    avatarUrl: z
      .string({
        invalid_type_error: "Avatar URL must be a string.",
      })
      .trim()
      .url({
        message: "Avatar URL must be a valid URL.",
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: `At least one field must be provided to update. Allowed fields: ${allowedUpdateUserFields.join(
      ", "
    )}.`,
  });
