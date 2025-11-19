export const allowedUsersFiltersParams = [
  "firstName",
  "lastName",
  "createdAt",
  "updatedAt",
] as const;
export const allowedUsersFieldsParams = [
  "firstName",
  "lastName",
  "username",
  "createdAt",
  "updatedAt",
] as const;
export const allowedUsersSortParams = [
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
  "firstName",
  "lastName",
  "username",
] as const;

export type AllowedUsersFiltersParams =
  (typeof allowedUsersFiltersParams)[number];
export type AllowedUsersFieldsParams =
  (typeof allowedUsersFieldsParams)[number];
export type AllowedUsersSortParams = (typeof allowedUsersSortParams)[number];
export type AllowedUpdateUserFields = (typeof allowedUpdateUserFields)[number];
