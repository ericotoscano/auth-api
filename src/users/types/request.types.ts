import z from "zod";
import { userIdSchema } from "../schemas";

export type FindUsersQuery = {
  fields?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserIdRequest = z.infer<typeof userIdSchema>;

export type UpdateUserRequest = {
  firstName?: string;
  lastName?: string;
  username?: string;
};
