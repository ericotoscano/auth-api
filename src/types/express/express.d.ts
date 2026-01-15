import { UserType } from "../user/user.type";
import { TournamentType } from "../tournament/tournament.type";
import { TokenPayload } from "../auth/auth.token.types";

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
