import { UserType } from "../../shared/types/user.types";

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
        headers?: unknown;
        cookies?: unknown;
        user?: UserType;
        tokenPayload?: TokenPayload;
      };
    }
  }
}

export {};
