import mongoose from "mongoose";
import { ENV } from "./env.utils";
import User from "../models/user.model";

export const connectToDB = async () => {
  try {
    const mongoUri = {
      test: ENV.MONGO_CONNECTION_STRING_TEST,
      development: ENV.MONGO_CONNECTION_STRING_DEVELOPMENT,
      production: ENV.MONGO_CONNECTION_STRING_PRODUCTION,
    }[ENV.NODE_ENV];

    if (!mongoUri)
      throw new Error(`Mongo URI not defined for env: ${ENV.NODE_ENV}`);

    const mongoDB = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await User.init();

    console.info(
      `Connected to MongoDB (${ENV.NODE_ENV}): ${mongoDB.connection.host}`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
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
