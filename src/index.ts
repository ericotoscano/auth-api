import app from "./app";
import { connectToDB, disconnectToDB } from "./infra/db/mongoose";
import { ENV } from "./infra/env/env";
import { logger } from "./infra/logger/logger";
import type { Server } from "http";

const APP_PORT = Number(ENV.APP_PORT);

let server: Server;

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

      server = app.listen(APP_PORT, () => {
        logger.info(`Server is running on ${ENV.APP_ORIGIN}`);
      });

      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    }
  } catch (error: any) {
    logger.error("Application startup failed");

    process.exit(1);
  }
})();
