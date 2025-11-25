import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

import { appErrorHandler } from "./middlewares/error.middlewares";
import { NotFoundError } from "./config/CustomError";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(
      "Resource Not Found",
      "Please verify the URL or check if the resource exists.",
      "RESOURCE_ERROR",
      {
        method: req.method,
        path: req.originalUrl,
      }
    )
  );
});

app.use(appErrorHandler);

export default app;
