import winston from "winston";

const { combine, errors, json, printf, timestamp } = winston.format;

const prettyOrderedJSON = printf((info) => {
  const ordered = {
    timestamp: info.timestamp,
    level: info.level,
    message: info.message,
    method: info.method,
    path: info.path,
    statusCode: info.statusCode,
    durationMs: info.duration,
    ip: info.ip,
    userAgent: info.userAgent,
    query: info.query,
    contentLength: info.contentLength,
    errorCode: info.errorCode,
    originalErrorCode: info.originalErrorCode,
    details: info.details,
    stack: info.stack,
  };

  return JSON.stringify(ordered, null, 2);
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss A",
    }),
    json(),
  ),
  transports: [
    new winston.transports.Console({
      format: prettyOrderedJSON,
    }),
  ],
});
