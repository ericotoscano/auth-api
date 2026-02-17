import z from "zod";
import { userIdSchema } from "../schemas";

export type FindUsersQueryRequest = {
  fields?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateUserByIdRequest = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

export type UserByIdRequest = z.infer<typeof userIdSchema>;
