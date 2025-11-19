import { signUpBaseSchema } from "./auth.schemas";

export const userEmailSchema = signUpBaseSchema.pick({ email: true });
