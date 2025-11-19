import { BadRequestError } from "../config/CustomError";
import { UpdateOptions } from "../types/services.types";

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
      "No Fields to Update Provided.",
      "You must provide at least one field to update, remove or push.",
      "NO_UPDATE_FIELDS_ERROR"
    );
  }

  return updateQuery;
};
