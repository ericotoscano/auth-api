import request from "supertest";
import app from "../app";
import User from "../models/user.model";
import { validSignupSchema } from "./unit/signup/signup.schema.fixtures";

const endpoint = "/api/v1/auth/signup";

describe("POST /api/v1/auth/signup", () => {
  it("should create a user, send verification email and return the proper status code/response", async () => {
    const res = await request(app)
      .post(endpoint)
      .send(validSignupSchema)
      .expect(201);

    expect(res.body).toStrictEqual({
      success: true,
      message:
        "User created successfully. Please access the provided email to verify your user account.",
      data: {
        userId: expect.any(String),
        isVerified: false,
        createdAt: expect.any(String),
      },
    });

    const userInDb = await User.findOne({
      email: validSignupSchema.email,
    }).lean();
    expect(userInDb).not.toBeNull();
    expect(userInDb?.email).toBe(validSignupSchema.email);
    expect(userInDb?.password).not.toBe(validSignupSchema.password);
  });
});
