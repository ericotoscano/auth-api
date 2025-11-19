export type SignUpRequestBody = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
};

export type LoginRequestBody = {
  identifier: string;
  password: string;
};

export type ResetPasswordRequestBody = Pick<
  SignUpRequestBody,
  "password" | "confirm"
>;

export type EmailRequestBody = Pick<SignUpRequestBody, "email">;

export type JWTRequestParams = { token: string };
