import { Request } from "express";
import { SortOrder } from "mongoose";
import { BadRequestError } from "../config/CustomError";
import { UpdateOptions } from "../types/services.types";
import {
  allowedUsersFieldsParams,
  AllowedUsersFieldsParams,
  AllowedUsersFiltersParams,
  allowedUsersFiltersParams,
  AllowedUsersSortParams,
  allowedUsersSortParams,
} from "../types/user/constants.types";

export const buildBaseUrl = <Q>(req: Request<{}, {}, {}, Q>): string => {
  return `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
};

export const buildAllowedFilters = (
  filter: Record<string, any>
): Partial<Record<AllowedUsersFiltersParams, any>> => {
  return Object.entries(filter).reduce((acc, [key, value]) => {
    if (
      allowedUsersFiltersParams.includes(key as AllowedUsersFiltersParams) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      acc[key as AllowedUsersFiltersParams] = value;
    }

    return acc;
  }, {} as Partial<Record<AllowedUsersFiltersParams, any>>);
};

export const buildAllowedFields = (
  fields?: (string | number | symbol)[]
): Partial<Record<AllowedUsersFieldsParams | "_id", 1>> => {
  if (!fields || fields.length === 0) {
    return allowedUsersFieldsParams.reduce(
      (acc, field) => {
        acc[field] = 1;
        return acc;
      },
      { _id: 1 } as Partial<Record<AllowedUsersFieldsParams | "_id", 1>>
    );
  }

  return fields.reduce(
    (acc, field) => {
      if (
        field &&
        allowedUsersFieldsParams.includes(field as AllowedUsersFieldsParams)
      ) {
        acc[field as AllowedUsersFieldsParams] = 1;
      }

      return acc;
    },
    { _id: 1 } as Partial<Record<AllowedUsersFieldsParams | "_id", 1>>
  );
};

export const buildAllowedSort = (
  sortParams?: readonly string[]
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
      acc.push([field, order]);
    }

    return acc;
  }, []);
};

export const buildPagination = (
  baseUrl: string,
  total: number,
  limit: number,
  offset: number,
  originalQuery: Record<string, any> = {}
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

export const buildUpdateQuery = <T extends Record<string, any>>(
  options: UpdateOptions<T>
): Record<string, any> => {
  const updateQuery: Record<string, any> = {};

  if (options.set && Object.keys(options.set).length > 0) {
    updateQuery.$set = options.set;
  }

  if (options.unset && options.unset.length > 0) {
    updateQuery.$unset = options.unset.reduce((acc, field) => {
      acc[field as string] = "";

      return acc;
    }, {} as Record<string, string>);
  }

  if (options.push && Object.keys(options.push).length > 0) {
    updateQuery.$push = options.push;
  }

  if (options.pull && Object.keys(options.pull).length > 0) {
    updateQuery.$pull = options.pull;
  }

  if (options.addToSet && Object.keys(options.addToSet).length > 0) {
    updateQuery.$addToSet = options.addToSet;
  }

  if (Object.keys(updateQuery).length === 0) {
    throw new BadRequestError(
      "No Provided Fields to Update",
      "You must provide at least one field to update, remove or push.",
      "FIELDS_UPDATE_ERROR",
      {}
    );
  }

  return updateQuery;
};
