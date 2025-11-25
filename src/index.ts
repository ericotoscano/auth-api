import app from "./app";
import { ENV } from "./utils/env.utils";
import { connectToDB } from "./utils/db.utils";
import { logger } from "./utils/logger";

const API_PORT = Number(ENV.API_PORT);

(async () => {
  try {
    if (ENV.NODE_ENV !== "test") {
      await connectToDB();

      app.listen(API_PORT, () => {
        logger.info(`Server is running on ${ENV.APP_ORIGIN}${API_PORT}`);
      });
    }
  } catch (error: any) {
    logger.error("Failed to connect to the database", {
      errorCode: "DB_CONNECTION_ERROR",
      details: { message: error.message },
      stack: error.stack,
    });
    
    process.exit(1);
  }
})();
