import type { UserType } from "@/shared/types/user.types";
import {
  AccessTokenClaims,
  VerifiedEmailToken,
} from "../../auth/types/token.types";

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
        token?: VerifiedEmailToken | AccessTokenClaims | RefreshTokenClaims;
      };
    }
  }
}

export {};
