export const allowedUsersFiltersParams = [
  "first_name",
  "last_name",
  "created_at",
  "updated_at",
] as const;

export const allowedUsersQueryFilters = [
  "firstName",
  "lastName",
  "createdAt",
  "updatedAt",
] as const;

export const allowedUsersFieldsParams = [
  "first_name",
  "last_name",
  "username",
  "created_at",
  "updated_at",
] as const;

export const allowedUsersQueryFields = [
  "firstName",
  "lastName",
  "username",
  "createdAt",
  "updatedAt",
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

export const allowedUpdateUserFields = [
  "first_name",
  "last_name",
  "username",
] as const;

export type AllowedUsersFiltersParams =
  (typeof allowedUsersFiltersParams)[number];

export type AllowedUsersQueryFilters =
  (typeof allowedUsersQueryFilters)[number];

export type AllowedUsersFieldsParams =
  (typeof allowedUsersFieldsParams)[number];

export type AllowedUsersQueryFields = (typeof allowedUsersQueryFields)[number];

export type AllowedUsersSortParams = (typeof allowedUsersSortParams)[number];

export type AllowedUsersQuerySort = (typeof allowedUsersQuerySort)[number];

export type AllowedUpdateUserFields = (typeof allowedUpdateUserFields)[number];
