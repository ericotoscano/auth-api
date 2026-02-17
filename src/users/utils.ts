import { Request } from "express";
import { SortOrder } from "mongoose";
import {
  AllowedUsersQueryFilters,
  AllowedUsersQueryFields,
  AllowedUsersQuerySort,
  allowedUsersQueryFields,
} from "./constants/user.constants";
import { ENV } from "../infra/env/env";
import {
  UserDocumentUpdateOptions,
  UserUpdateByIdOptions,
} from "./types/services.types";

const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const isAllowedParams = <T extends readonly string[]>(
  value: string,
  allowedValues: T,
): value is T[number] => {
  return allowedValues.includes(value as T[number]);
};

export const buildBaseUrl = <Q>(req: Request<{}, {}, {}, Q>): string => {
  return `${req.protocol}://${req.get("host") || `localhost:${ENV.APP_PORT}`}${
    req.baseUrl
  }${req.path}`;
};

export const buildQueryFilters = (
  filter: Partial<Record<AllowedUsersQueryFilters, string | Date>>,
): Partial<
  Record<AllowedUsersQueryFilters, RegExp | { $gte: Date; $lte: Date }>
> => {
  const filterQuery: Partial<
    Record<AllowedUsersQueryFilters, RegExp | { $gte: Date; $lte: Date }>
  > = {};

  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== "") {
      const typedKey = key as AllowedUsersQueryFilters;

      if (typeof value === "string") {
        filterQuery[typedKey] = new RegExp(`^${escapeRegex(value)}$`, "i");
      }

      if (value instanceof Date) {
        const start = new Date(value);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(value);
        end.setUTCHours(23, 59, 59, 999);

        filterQuery[typedKey] = { $gte: start, $lte: end };
      }
    }
  }

  return filterQuery;
};

export const buildQueryFields = (fields?: AllowedUsersQueryFields[]) => {
  const finalFields = fields?.length ? fields : [...allowedUsersQueryFields];

  return Object.fromEntries(
    finalFields.map((field) => [field, 1] as const),
  ) as Partial<Record<AllowedUsersQueryFields, 1>>;
};

export const buildQuerySort = (
  sortParams?: AllowedUsersQuerySort[],
): [string, SortOrder][] => {
  if (!sortParams?.length) return [];

  return sortParams.map((param) => {
    const direction: SortOrder = param.startsWith("-") ? -1 : 1;
    const field = param.replace("-", "");

    return [field, direction];
  });
};

export const buildPagination = (
  baseUrl: string,
  total: number,
  limit: number,
  offset: number,
  originalQuery: Record<string, any> = {},
): { nextUrl: string | null; previousUrl: string | null } => {
  const nextOffset = offset + limit;
  const previousOffset = Math.max(offset - limit, 0);

  const buildUrl = (newOffset: number): string => {
    const params = new URLSearchParams(originalQuery);

    params.set("limit", limit.toString());
    params.set("offset", newOffset.toString());

    return `${baseUrl}?${params.toString()}`;
  };

  const nextUrl = nextOffset < total ? buildUrl(nextOffset) : null;
  const previousUrl = offset > 0 ? buildUrl(previousOffset) : null;

  return { nextUrl, previousUrl };
};

export const buildUserDocumentUpdateQuery = (
  options: UserDocumentUpdateOptions,
): Record<string, any> => {
  const updateQuery: Record<string, any> = {};

  if (options.set && Object.keys(options.set).length > 0) {
    updateQuery.$set = options.set;
  }

  if (options.unset && options.unset.length > 0) {
    updateQuery.$unset = options.unset.reduce(
      (acc, field) => {
        acc[field as string] = "";

        return acc;
      },
      {} as Record<string, string>,
    );
  }

  return updateQuery;
};

export const buildUserUpdateByIdQuery = (
  options: UserUpdateByIdOptions,
): Record<string, any> => {
  const updateQuery: Record<string, any> = {};

  if (options.set && Object.keys(options.set).length > 0) {
    updateQuery.$set = options.set;
  }

  return updateQuery;
};
