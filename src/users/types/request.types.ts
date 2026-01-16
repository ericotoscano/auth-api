import z from "zod";
import { userIdSchema } from "../schemas";

export type UserIdRequest = z.infer<typeof userIdSchema>;

export type UpdateUserRequestBody = {
  firstName?: string;
  lastName?: string;
  username?: string;
};
