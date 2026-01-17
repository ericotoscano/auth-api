import mongoose from "mongoose";
import User from "../../users/model";
import { logger } from "../logger/logger";
import { InternalServerError } from "../../errors/custom-error";
import { ENV } from "../env/env";

export const connectToDB = async () => {
  try {
    const mongoUri = {
      test: ENV.TEST_DB_URI,
      development: ENV.DEV_DB_URI,
      production: ENV.PROD_DB_URI,
    }[ENV.NODE_ENV];

    if (!mongoUri)
      throw new InternalServerError(
        "Database Configuration Error",
        `Database URI is not defined for environment: ${ENV.NODE_ENV}`,
        "SYSTEM_UNEXPECTED",
      );

    const mongoDB = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await User.init();

    logger.info(
      `Connected to DB (${ENV.NODE_ENV}): ${mongoDB.connection.host}`,
    );
  } catch (error: any) {
    logger.error("Failed to connect to database", {
      errorCode: "SYSTEM_UNEXPECTED",
      details: error.message,
      stack: error.stack,
    });

    throw new InternalServerError(
      "Database Connection Failed",
      "Failed to connect to the database. Please try again later.",
      "SYSTEM_UNEXPECTED",
    );
  }
};

export async function disconnectToDB() {
  try {
    await mongoose.disconnect();

    logger.info("Disconnected from database");
  } catch (error: any) {
    logger.warn("Failed to disconnect from database", {
      errorCode: "SYSTEM_UNEXPECTED",
      details: error.message,
    });
  }
}

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const coll = collections[key];
    try {
      await coll.deleteMany({});
    } catch (error: any) {
      logger.warn("Failed to clear collection", {
        collection: key,
        error: error.message,
      });
    }
  }
};

export const runInTransaction = async <T>(
  fn: (session: mongoose.ClientSession) => Promise<T>,
): Promise<T> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await fn(session);

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error: unknown) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  } finally {
    session.endSession();
  }
};

export { mongoose };
