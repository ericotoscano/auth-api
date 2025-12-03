import { clearDatabase, connectToDB, disconnectToDB } from "../utils/db.utils";

beforeAll(async () => {
  await connectToDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectToDB();
});
