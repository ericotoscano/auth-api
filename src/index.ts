import app from "./app";
import { ENV } from "./utils/env.utils";
import { connectToDB } from "./utils/db.utils";

const API_PORT = Number(ENV.API_PORT);

(async () => {
  try {
    if (ENV.NODE_ENV !== "test") {
      await connectToDB();

      app.listen(API_PORT, () => {
        console.info(`Server is running on http://localhost:${API_PORT}.`);
      });
    }
  } catch (error) {
    console.error("Failed to connect to the database.");
    console.error(error);
    process.exit(1);
  }
})();
