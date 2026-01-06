export const validSignupSchema = {
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  email: "testuser@example.com",
  password: "test1234",
  confirm: "test1234",
};

export const allowedSignupSchemaFields = [
  "firstName",
  "lastName",
  "username",
  "email",
  "password",
  "confirm",
] as const;
