import request from "supertest";
import app from "../app";
import User from "../models/user.model";

describe("POST /api/v1/auth/signup", () => {
  const endpoint = "/api/v1/auth/signup";

  it("should create a user (201), send verification email and return the proper response", async () => {
    const payload = {
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      email: "testuser@example.com",
      password: "test1234",
      confirm: "test1234",
    };

    const res = await request(app).post(endpoint).send(payload).expect(201);

    expect(res.body).toStrictEqual({
      success: true,
      message:
        "User created successfully. Please access the provided email to verify your user account.",
      data: {
        _id: expect.any(String),
        isVerified: false,
        createdAt: expect.any(String),
      },
    });

    const userInDb = await User.findOne({ email: payload.email }).lean();
    expect(userInDb).not.toBeNull();
    expect(userInDb?.email).toBe(payload.email);
    expect(userInDb?.password).not.toBe(payload.password);
  });
});
