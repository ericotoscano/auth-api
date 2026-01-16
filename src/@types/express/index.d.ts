import type { UserType } from "@/shared/types/user.types";
import type { TokenPayload } from "@/auth/types/token.types";

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
