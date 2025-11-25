import winston from "winston";
import { ENV } from "./env.utils";

const { combine, errors, json, printf, timestamp } = winston.format;

const prettyOrderedJSON = printf((info) => {
  const ordered = {
    level: info.level,
    message: info.message,
    errorCode: info.errorCode,
    details: info.details,
    timestamp: info.timestamp,
    stack: info.stack,
  };

  return JSON.stringify(ordered, null, 2);
});

export const logger = winston.createLogger({
  level: ENV.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss A",
    }),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: prettyOrderedJSON,
    }),
  ],
});
