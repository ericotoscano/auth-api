import { z } from "zod";
import { signUpBaseSchema } from "../auth/schemas";
import {
  allowedUpdateUserFields,
  AllowedUsersFieldsParams,
  allowedUsersFieldsParams,
  AllowedUsersQueryFields,
  AllowedUsersQuerySort,
  AllowedUsersSortParams,
  allowedUsersSortParams,
  queryMap,
} from "./constants/user.constants";
import { isAllowedParams } from "./utils";

export const userIdSchema = z.object({
  id: z
    .string({
      required_error: "The user id is required.",
      invalid_type_error: "The user id must be a string.",
    })
    .length(24, {
      message: "Invalid user id length. Must be exactly 24 characters.",
    })
    .regex(/^[a-fA-F0-9]{24}$/, {
      message:
        "Invalid user id format. Must be a 24 character hexadecimal string.",
    })
    .nonempty({ message: "The user id cannot be empty." }),
});

export const userEmailSchema = signUpBaseSchema.pick({ email: true });

export const findUsersSchema = z
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
            isAllowedParams(field, allowedUsersFieldsParams),
          );
        },
        {
          message: `Invalid "fields" query parameter. Allowed fields: ${allowedUsersFieldsParams.join(
            ", ",
          )}.`,
        },
      )
      .transform((data) =>
        data
          ? (data
              .split(",")
              .map(
                (field) => queryMap[field as AllowedUsersFieldsParams],
              ) as AllowedUsersQueryFields[])
          : undefined,
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
            isAllowedParams(sort, allowedUsersSortParams),
          );
        },
        {
          message: `Invalid "sort" query parameter. Allowed sort: ${allowedUsersSortParams.join(
            ", ",
          )}.`,
        },
      )
      .transform((data) =>
        data
          ? (data
              .split(",")
              .map(
                (sort) => queryMap[sort as AllowedUsersSortParams],
              ) as AllowedUsersQuerySort[])
          : undefined,
      ),

    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().nonnegative().optional(),

    first_name: z
      .string({
        invalid_type_error: '"first_name" query parameter must be a string.',
      })
      .optional()
      .transform((data) => (data?.trim() === "" ? undefined : data)),

    last_name: z
      .string({
        invalid_type_error: '"last_name" query parameter must be a string.',
      })
      .optional(),

    created_at: z
      .string({
        invalid_type_error: '"created_at" query parameter must be a string.',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: '"created_at" must be in the format YYYY-MM-DD.',
      })
      .optional()
      .transform((data) => (data ? new Date(data) : undefined)),

    updated_at: z
      .string({
        invalid_type_error: '"updated_at" query parameter must be a string.',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: '"updated_at" must be in the format YYYY-MM-DD.',
      })
      .optional()
      .transform((data) => (data ? new Date(data) : undefined)),
  })
  .strict()
  .transform((data) => ({
    fields: data.fields,
    sort: data.sort,
    limit: data.limit,
    offset: data.offset,
    firstName: data.first_name,
    lastName: data.last_name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }));

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
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: `At least one field must be provided to update. Allowed fields: ${allowedUpdateUserFields.join(
      ", ",
    )}.`,
  });
