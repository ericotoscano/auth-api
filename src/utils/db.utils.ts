import mongoose from "mongoose";
import { ENV } from "./env.utils";
import User from "../models/user.model";
import { logger } from "./logger";

export const connectToDB = async () => {
  try {
    const mongoUri = {
      test: ENV.DB_CONNECTION_STRING_TEST,
      development: ENV.DB_CONNECTION_STRING_DEVELOPMENT,
    }[ENV.NODE_ENV];

    if (!mongoUri)
      throw new Error(`DB connection URI is not defined for environment: ${ENV.NODE_ENV}`);

    const mongoDB = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await User.init();

    logger.info(
      `Connected to DB (${ENV.NODE_ENV}): ${mongoDB.connection.host}`
    );
  } catch (error) {
    throw error;
  }
};

export const runInTransaction = async <T>(
  fn: (session: mongoose.ClientSession) => Promise<T>
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
  }
};

export { mongoose };
