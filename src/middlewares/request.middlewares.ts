import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { filterInfo } from "../utils/info.utils";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.locals.__hasError = false;

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (res.locals.__hasError) return;

    logger.info("HTTP Request", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      query: req.query,
      params: req.params,
      body: filterInfo(req.body, ["identifier", "password"]),
      contentLength: res.getHeader("content-length"),
      timestamp: new Date().toISOString(),
    });
  });

  next();
};
