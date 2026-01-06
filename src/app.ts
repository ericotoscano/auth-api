import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

import { appErrorHandler } from "./middlewares/error.middlewares";
import { NotFoundError } from "./config/CustomError";
import { requestLogger } from "./middlewares/request.middlewares";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(requestLogger);
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(
      "Resource Not Found",
      "Please verify the URL or check if the resource exists.",
      "SYSTEM_UNEXPECTED"
    )
  );
});

app.use(appErrorHandler);

export default app;
