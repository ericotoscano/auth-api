import { z } from "zod";

export const signUpBaseSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required.",
      invalid_type_error: "First name must be a string.",
    })
    .trim()
    .min(2, { message: "First name must be at least 2 characters long." })
    .max(20, { message: "First name must be no longer than 20 characters." }),

  lastName: z
    .string({
      required_error: "Last name is required.",
      invalid_type_error: "Last name must be a string.",
    })
    .trim()
    .min(2, { message: "Last name must be at least 2 characters long." })
    .max(20, { message: "Last name must be no longer than 20 characters." }),

  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be a string.",
    })
    .trim()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(8, { message: "Username must be no longer than 8 characters." }),

  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .trim()
    .email({ message: "Email is invalid." }),

  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .trim()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(15, { message: "Password must be no longer than 15 characters." }),

  confirm: z
    .string({
      required_error: "Confirm password is required.",
      invalid_type_error: "Confirm password must be a string.",
    })
    .trim()
    .min(1, { message: "Confirm password cannot be empty." }),
});

export const signUpSchema = signUpBaseSchema.refine(
  (data) => data.password === data.confirm,
  {
    message: "Password and confirm must match.",
    path: ["confirm"],
  }
);

export const loginSchema = z
  .object({
    identifier: z
      .string({
        required_error: "Identifier is required.",
        invalid_type_error: "Identifier must be a string.",
      })
      .min(3, { message: "Identifier must be at least 3 characters long." }),
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

const resetPasswordBaseSchema = signUpBaseSchema.pick({
  password: true,
  confirm: true,
});

export const resetPasswordSchema = resetPasswordBaseSchema.refine(
  (data) => data.password === data.confirm,
  {
    message: "Passwords must match.",
    path: ["confirm"],
  }
);
