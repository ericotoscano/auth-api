import app from "./app";
import { ENV } from "./utils/env.utils";
import { connectToDB, disconnectToDB } from "./utils/db.utils";
import { logger } from "./utils/logger";
import http from "http";

const API_PORT = Number(ENV.API_PORT);

let server: http.Server;

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });
      });
    }

    await disconnectToDB();

    logger.info("Graceful shutdown complete");

    process.exit(0);
  } catch (error) {
    logger.error("Graceful shutdown failed", {
      errorCode: "SYSTEM_UNEXPECTED",
    });

    process.exit(1);
  }
};

(async () => {
  try {
    if (ENV.NODE_ENV !== "test") {
      await connectToDB();

      server = app.listen(API_PORT, () => {
        logger.info(`Server is running on ${ENV.APP_ORIGIN}${API_PORT}`);
      });

      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    }
  } catch (error: any) {
    logger.error("Application startup failed");

    process.exit(1);
  }
})();
