import { Request } from "express";
import { SortOrder } from "mongoose";
import {
  AllowedUsersFiltersParams,
  AllowedUsersFieldsParams,
  AllowedUsersSortParams,
  AllowedUsersQueryFilters,
  AllowedUsersQueryFields,
  AllowedUsersQuerySort,
  allowedUsersFiltersParams,
  allowedUsersFieldsParams,
  allowedUsersSortParams,
} from "./constants/user.constants";
import { UpdateUserOptions } from "./types/services.types";
import { ENV } from "../infra/env/env";

const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const queryMap: Record<
  AllowedUsersFiltersParams | AllowedUsersFieldsParams | AllowedUsersSortParams,
  AllowedUsersQueryFilters | AllowedUsersQueryFields | AllowedUsersQuerySort
> = {
  first_name: "firstName",
  "-first_name": "-firstName",
  last_name: "lastName",
  "-last_name": "-lastName",
  username: "username",
  "-username": "-username",
  created_at: "createdAt",
  "-created_at": "-createdAt",
  updated_at: "updatedAt",
  "-updated_at": "-updatedAt",
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
  filter: Record<string, any>,
): Partial<Record<AllowedUsersQueryFilters, any>> => {
  return Object.entries(filter).reduce(
    (acc, [key, value]) => {
      if (
        allowedUsersFiltersParams.includes(key as AllowedUsersFiltersParams) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        const mappedKey = queryMap[key as AllowedUsersFiltersParams];

        acc[mappedKey as AllowedUsersQueryFilters] = new RegExp(
          `^${escapeRegex(value)}$`,
          "i",
        );
      }

      return acc;
    },
    {} as Partial<Record<AllowedUsersQueryFilters, any>>,
  );
};

export const buildQueryFields = (
  fields?: (string | number | symbol)[],
): Partial<Record<AllowedUsersQueryFields, 1>> => {
  if (!fields || fields.length === 0) return {};

  return fields.reduce(
    (acc, field) => {
      if (
        allowedUsersFieldsParams.includes(field as AllowedUsersFieldsParams)
      ) {
        const mappedKey = queryMap[field as AllowedUsersFieldsParams];

        acc[mappedKey as AllowedUsersQueryFields] = 1;
      }

      return acc;
    },
    {} as Partial<Record<AllowedUsersQueryFields, 1>>,
  );
};

export const buildQuerySort = (
  sortParams?: string[],
): [string, SortOrder][] => {
  if (!sortParams || sortParams.length === 0) return [];

  return sortParams.reduce<[string, SortOrder][]>((acc, sort) => {
    if (!sort) return acc;

    let field: string;
    let order: SortOrder;

    if (sort.startsWith("-")) {
      field = sort.slice(1);
      order = -1;
    } else {
      field = sort;
      order = 1;
    }

    if (allowedUsersSortParams.includes(field as AllowedUsersSortParams)) {
      const mappedKey = queryMap[field as AllowedUsersSortParams];

      acc.push([mappedKey, order]);
    }

    return acc;
  }, []);
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

export const buildUpdateQuery = (
  options: UpdateUserOptions,
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
