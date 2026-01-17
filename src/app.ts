import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./auth/routes";
import userRoutes from "./users/routes";
import { appErrorHandler } from "./errors/error-handler";
import { NotFoundError } from "./errors/custom-error";
import { requestLogger } from "./infra/http/middlewares/request-logger.middleware";
import { fileURLToPath } from "url";
import { ENV } from "./infra/env/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: ENV.FRONTEND_ORIGIN, credentials: true }));
app.use(requestLogger);
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(
      "Resource Not Found",
      "Please verify the URL or check if the resource exists.",
      "RESOURCE_NOT_FOUND",
    ),
  );
});

app.use(appErrorHandler);

export default app;
