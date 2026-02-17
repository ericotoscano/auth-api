export const allowedUsersQueryFilters = [
  "firstName",
  "lastName",
  "createdAt",
  "updatedAt",
] as const;

export const allowedUsersQueryFields = [
  "firstName",
  "lastName",
  "username",
  "createdAt",
  "updatedAt",
] as const;

export const allowedUsersQuerySort = [
  "firstName",
  "-firstName",
  "lastName",
  "-lastName",
  "username",
  "-username",
  "createdAt",
  "-createdAt",
  "updatedAt",
  "-updatedAt",
] as const;

export const allowedUsersFieldsParams = [
  "first_name",
  "last_name",
  "username",
  "created_at",
  "updated_at",
] as const;

export const allowedUsersFiltersParams = [
  "first_name",
  "last_name",
  "created_at",
  "updated_at",
] as const;

export const allowedUsersSortParams = [
  "first_name",
  "-first_name",
  "last_name",
  "-last_name",
  "username",
  "-username",
  "created_at",
  "-created_at",
  "updated_at",
  "-updated_at",
] as const;

export const allowedUpdateUserFields = [
  "first_name",
  "last_name",
  "username",
] as const;

export const queryMap = {
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
} as const;

export type AllowedUsersQueryFilters =
  (typeof allowedUsersQueryFilters)[number];

export type AllowedUsersQueryFields = (typeof allowedUsersQueryFields)[number];

export type AllowedUsersQuerySort = (typeof allowedUsersQuerySort)[number];

export type AllowedUsersFieldsParams =
  (typeof allowedUsersFieldsParams)[number];

export type AllowedUsersFiltersParams =
  (typeof allowedUsersFiltersParams)[number];

export type AllowedUsersSortParams = (typeof allowedUsersSortParams)[number];

export type AllowedUpdateUserFields = (typeof allowedUpdateUserFields)[number];
