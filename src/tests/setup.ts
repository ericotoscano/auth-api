import {
  clearDatabase,
  connectToDB,
  disconnectToDB,
} from "../infra/db/mongoose";

beforeAll(async () => {
  await connectToDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectToDB();
});
