import { z } from "zod";

export const signUpBaseSchema = z.object({
  firstName: z
    .string({
      required_error: "firstName is required.",
      invalid_type_error: "firstName must be a string.",
    })
    .trim()
    .min(2, { message: "firstName must be at least 2 characters long." })
    .max(20, { message: "firstName must be no longer than 20 characters." }),

  lastName: z
    .string({
      required_error: "lastName is required.",
      invalid_type_error: "lastName must be a string.",
    })
    .trim()
    .min(2, { message: "lastName must be at least 2 characters long." })
    .max(20, { message: "lastName must be no longer than 20 characters." }),

  username: z
    .string({
      required_error: "username is required.",
      invalid_type_error: "username must be a string.",
    })
    .trim()
    .min(3, { message: "username must be at least 3 characters long." })
    .max(8, { message: "username must be no longer than 8 characters." }),

  email: z
    .string({
      required_error: "email is required.",
      invalid_type_error: "email must be a string.",
    })
    .trim()
    .email({ message: "email is invalid." }),

  password: z
    .string({
      required_error: "password is required.",
      invalid_type_error: "password must be a string.",
    })
    .trim()
    .min(8, { message: "password must be at least 8 characters long." })
    .max(15, { message: "password must be no longer than 15 characters." }),

  confirm: z
    .string({
      required_error: "confirm is required.",
      invalid_type_error: "confirm must be a string.",
    })
    .trim()
    .min(1, { message: "confirm cannot be empty." }),
});

export const signUpSchema = signUpBaseSchema.refine(
  (data) => data.password === data.confirm,
  {
    message: "password and confirm must match.",
    path: ["confirm"],
  }
);

export const loginSchema = z
  .object({
    identifier: z
      .string({
        required_error: "identifier is required.",
        invalid_type_error: "identifier must be a string.",
      })
      .min(3, { message: "identifier must be at least 3 characters long." }),
    password: signUpBaseSchema.shape.password,
  })
  .superRefine((data, ctx) => {
    const isEmail = /\S+@\S+\.\S+/.test(data.identifier);

    if (!isEmail && data.identifier.length > 8) {
      ctx.addIssue({
        path: ["identifier"],
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email or username.",
      });
    }
  });

export const resetPasswordSchema = signUpBaseSchema
  .pick({
    password: true,
    confirm: true,
  })
  .refine((data) => data.password === data.confirm, {
    message: "password and confirm must match.",
    path: ["confirm"],
  });
