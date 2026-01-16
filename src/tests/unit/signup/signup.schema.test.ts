import {
  allowedSignupSchemaFields,
  validSignupSchema,
} from "./signup.schema.fixtures";
import { signUpSchema } from "../../../auth/schemas";

describe("Signup Schema Validation", () => {
  describe("Valid Data", () => {
    it("should validate successfully with valid data", async () => {
      const result = signUpSchema.safeParse(validSignupSchema);

      expect(result.success).toBe(true);
    });
  });

  describe("Required Fields", () => {
    for (const field of allowedSignupSchemaFields) {
      it(`should fail when '${field}' is missing`, () => {
        const { [field]: _, ...schemaWithoutField } = validSignupSchema;

        const result = signUpSchema.safeParse(schemaWithoutField);

        expect(result.success).toBe(false);

        const issue = result.success ? null : result.error.issues[0];

        expect(issue?.message).toStrictEqual(`${field} is required.`);
      });
    }
  });

  describe("Invalid Type Fields", () => {
    for (const field of allowedSignupSchemaFields) {
      it(`should fail when '${field}' is not a string`, () => {
        const invalidSchema = { ...validSignupSchema, [field]: 1 };

        const result = signUpSchema.safeParse(invalidSchema);

        expect(result.success).toBe(false);

        const issue = result.success ? null : result.error.issues[0];

        expect(issue?.message).toStrictEqual(`${field} must be a string.`);
      });
    }
  });

  describe("Min Length Fields", () => {
    for (const field of ["firstName", "lastName"] as const) {
      it(`should fail when '${field}' is too short`, () => {
        const invalidSchema = { ...validSignupSchema, [field]: "a" };

        const result = signUpSchema.safeParse(invalidSchema);

        expect(result.success).toBe(false);

        const issue = result.success ? null : result.error.issues[0];

        expect(issue?.message).toStrictEqual(
          `${field} must be at least 2 characters long.`,
        );
      });
    }

    it("should fail when 'username' is too short", () => {
      const invalidSchema = { ...validSignupSchema, username: "ab" };

      const result = signUpSchema.safeParse(invalidSchema);

      expect(result.success).toBe(false);

      const issue = result.success ? null : result.error.issues[0];

      expect(issue?.message).toStrictEqual(
        "username must be at least 3 characters long.",
      );
    });

    it("should fail when 'password' is too short", () => {
      const invalidSchema = { ...validSignupSchema, password: "abcdefg" };

      const result = signUpSchema.safeParse(invalidSchema);

      expect(result.success).toBe(false);

      const issue = result.success ? null : result.error.issues[0];

      expect(issue?.message).toStrictEqual(
        "password must be at least 8 characters long.",
      );
    });

    it("should fail when 'confirm' is empty", () => {
      const invalidSchema = { ...validSignupSchema, confirm: "" };

      const result = signUpSchema.safeParse(invalidSchema);

      expect(result.success).toBe(false);

      const issue = result.success ? null : result.error.issues[0];

      expect(issue?.message).toStrictEqual("confirm cannot be empty.");
    });
  });

  describe("Max Length Fields", () => {
    for (const field of ["firstName", "lastName"] as const) {
      it(`should fail when '${field}' is too long`, () => {
        const invalidSchema = { ...validSignupSchema, [field]: "a".repeat(21) };

        const result = signUpSchema.safeParse(invalidSchema);

        expect(result.success).toBe(false);

        const issue = result.success ? null : result.error.issues[0];

        expect(issue?.message).toStrictEqual(
          `${field} must be no longer than 20 characters.`,
        );
      });
    }

    it("should fail when 'username' is too long", () => {
      const invalidSchema = { ...validSignupSchema, username: "a".repeat(9) };

      const result = signUpSchema.safeParse(invalidSchema);

      expect(result.success).toBe(false);

      const issue = result.success ? null : result.error.issues[0];

      expect(issue?.message).toStrictEqual(
        "username must be no longer than 8 characters.",
      );
    });

    it("should fail when 'password' is too long", () => {
      const invalidSchema = { ...validSignupSchema, password: "a".repeat(16) };

      const result = signUpSchema.safeParse(invalidSchema);

      expect(result.success).toBe(false);

      const issue = result.success ? null : result.error.issues[0];

      expect(issue?.message).toStrictEqual(
        "password must be no longer than 15 characters.",
      );
    });
  });

  describe("Invalid Email Format", () => {
    it("should fail when email format is invalid", () => {
      const invalidSchema = { ...validSignupSchema, email: "a" };

      const result = signUpSchema.safeParse(invalidSchema);

      expect(result.success).toBe(false);

      const issue = result.success ? null : result.error.issues[0];

      expect(issue?.message).toStrictEqual("email is invalid.");
    });
  });

  describe("Password/Confirm Mismatch", () => {
    it("should fail when password and confirm do not match", () => {
      const invalidSchema = {
        ...validSignupSchema,
        password: "password123",
        confirm: "password456",
      };

      const result = signUpSchema.safeParse(invalidSchema);

      expect(result.success).toBe(false);

      const issue = result.success ? null : result.error.issues[0];

      expect(issue?.message).toStrictEqual("password and confirm must match.");
    });
  });
});
