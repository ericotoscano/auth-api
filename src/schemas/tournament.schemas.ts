import { z } from "zod";
import {
  AllowedTournamentsFieldsParams,
  AllowedTournamentsSortParams,
  allowedNetworks,
  allowedTournamentsFieldsParams,
  allowedTournamentsSortParams,
  allowedUpdateTournamentFields,
} from "../types/tournament/constants.types";
import { isAllowedParams } from "../utils/params.utils";
import { mongoose } from "../utils/db.utils";
import {
  admIdSchema,
  driverIdSchema,
  tournamentIdSchema,
} from "../schemas/id.schema";

export const createTournamentSchema = z.object({
  title: z
    .string({
      required_error: "Tournament title is required.",
      invalid_type_error: "Tournament title must be a string.",
    })
    .trim()
    .min(1, {
      message: "Tournament title must be at least 1 character long.",
    })
    .max(30, {
      message: "Tournament title must be no longer than 30 characters.",
    }),
  description: z
    .string({
      invalid_type_error: "Description must be a string.",
    })
    .trim()
    .max(200, {
      message: "Description must be at most 200 characters.",
    })
    .optional(),
  banner: z
    .string({
      invalid_type_error: "Banner must be a string.",
    })
    .trim()
    .url({
      message: "Banner must be a valid URL.",
    })
    .optional(),
  rules: z
    .string({
      invalid_type_error: "Rules must be a string.",
    })
    .trim()
    .max(1000, {
      message: "Rules must be at most 1000 characters.",
    })
    .optional(),
});

export const findAllTournamentsSchema = z
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
            isAllowedParams(field, allowedTournamentsFieldsParams)
          );
        },
        {
          message: `Invalid "fields" query parameter. Allowed fields: ${allowedTournamentsFieldsParams.join(
            ", "
          )}.`,
        }
      )
      .transform((data) =>
        data ? (data.split(",") as AllowedTournamentsFieldsParams[]) : undefined
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
            isAllowedParams(sort, allowedTournamentsSortParams)
          );
        },
        {
          message: `Invalid "sort" query parameter. Allowed sort: ${allowedTournamentsSortParams.join(
            ", "
          )}.`,
        }
      )
      .transform((data) =>
        data ? (data.split(",") as AllowedTournamentsSortParams[]) : undefined
      ),

    limit: z.coerce.number().int().positive().optional(),
    offset: z.coerce.number().int().nonnegative().optional(),

    title: z
      .string({
        invalid_type_error: '"title" query parameter must be a string.',
      })
      .optional()
      .transform((data) => (data?.trim() === "" ? undefined : data)),

    banner: z
      .string({
        invalid_type_error: '"banner" query parameter must be a string.',
      })
      .optional(),

    isFinished: z.coerce
      .boolean({
        invalid_type_error: '"isFinished" query parameter must be a boolean.',
      })
      .optional(),

    startDate: z
      .string({
        invalid_type_error: '"startDate" query parameter must be a string.',
      })
      .optional()
      .refine((data) => data === undefined || !isNaN(Date.parse(data)), {
        message: '"startDate" must be a valid ISO date string.',
      })
      .transform((data) => (data ? new Date(data) : undefined)),

    endDate: z
      .string({
        invalid_type_error: '"endDate" query parameter must be a string.',
      })
      .optional()
      .refine((data) => data === undefined || !isNaN(Date.parse(data)), {
        message: '"endDate" must be a valid ISO date string.',
      })
      .transform((data) => (data ? new Date(data) : undefined)),

    admId: z
      .string({
        invalid_type_error: '"admId" query parameter must be a string.',
      })
      .refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: '"admId" must be a valid Mongo ObjectId.',
      })
      .optional(),

    network: z
      .enum(allowedNetworks, {
        invalid_type_error:
          '"network" query parameter must be one of: ethereum or solana.',
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

const pointsSystemSchema = z.object({
  position: z
    .number({ invalid_type_error: "Position must be a number." })
    .int()
    .nonnegative(),
  points: z
    .number({ invalid_type_error: "Points must be a number." })
    .nonnegative(),
});

const bonusPointsSchema = z.object({
  type: z.literal("fastestLap", {
    invalid_type_error: 'Bonus point type must be "fastestLap".',
  }),
  points: z
    .number({ invalid_type_error: "Bonus points must be a number." })
    .nonnegative(),
});

export const updateTournamentSchema = z
  .object({
    title: z
      .string({ invalid_type_error: "Tournament title must be a string." })
      .trim()
      .min(1, {
        message: "Tournament title must be at least 1 character long.",
      })
      .max(30, {
        message: "Tournament title must be no longer than 30 characters.",
      })
      .optional(),

    description: z
      .string({ invalid_type_error: "Description must be a string." })
      .trim()
      .max(200, { message: "Description must be at most 200 characters." })
      .optional(),

    banner: z
      .string({ invalid_type_error: "Banner must be a string." })
      .trim()
      .url({ message: "Banner must be a valid URL." })
      .optional(),

    rules: z
      .string({ invalid_type_error: "Rules must be a string." })
      .trim()
      .max(1000, { message: "Rules must be at most 1000 characters." })
      .optional(),

    pointsSystem: z
      .array(pointsSystemSchema, {
        invalid_type_error:
          "Points system must be an array of { position, points }.",
      })
      .optional(),

    bonusPoints: z
      .array(bonusPointsSchema, {
        invalid_type_error:
          "Bonus points must be an array of { type, points }.",
      })
      .optional(),

    variableRacePoints: z
      .boolean({
        invalid_type_error: "Variable race points must be a boolean.",
      })
      .optional(),

    startDate: z.coerce
      .date({
        invalid_type_error: "Start date must be a valid ISO date string.",
      })
      .optional(),

    endDate: z.coerce
      .date({ invalid_type_error: "End date must be a valid ISO date string." })
      .optional(),

    prizePool: z
      .number({ invalid_type_error: "Prize pool must be a number." })
      .nonnegative()
      .optional(),

    network: z
      .enum(["ethereum", "solana"], {
        invalid_type_error: 'Network must be "ethereum" or "solana".',
      })
      .optional(),

    rewardContractAddress: z
      .string({
        invalid_type_error: "Reward contract address must be a string.",
      })
      .trim()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: `At least one field must be provided to update. Allowed fields: ${allowedUpdateTournamentFields.join(
      ", "
    )}.`,
  });

export const removeAdmFromTournamentSchema = tournamentIdSchema
  .merge(admIdSchema)
  .strict();
export const removeDriverFromTournamentSchema = tournamentIdSchema
  .merge(driverIdSchema)
  .strict();
