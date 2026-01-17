import { Request, Response, NextFunction } from "express";
import { logger } from "../../logger/logger";
import { filterInfo } from "../../../shared/utils/filter.utils";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.locals.__hasError = false;

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (res.locals.__hasError) return;

    logger.info("HTTP Request", {
      method: req.method,
      path: req.originalUrl.split("?")[0],
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      query: filterInfo(req.query, [
        "last_name",
        "first_name",
        "created_at",
        "updated_at",
      ]),
      contentLength: res.getHeader("content-length"),
    });
  });

  next();
};
