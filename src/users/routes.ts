import { Router } from "express";
import { validateSchema } from "../infra/http/middlewares/validate-schema.middleware";
import {
  deleteUserById,
  findAllUsers,
  findUserById,
  updateUserById,
} from "./controller";
import { findAllUsersSchema, updateUserSchema, userIdSchema } from "./schemas";
import { validateToken } from "../auth/middlewares";
import { validateUserSelfPermission } from "./middlewares";

const router = Router();

router.get(
  "/",
  validateToken("access"),
  validateSchema(findAllUsersSchema, "query"),
  findAllUsers,
);

router
  .route("/:id")
  .all(validateToken("access"), validateSchema(userIdSchema, "params"))
  .get(findUserById)
  .patch(
    validateUserSelfPermission,
    validateSchema(updateUserSchema, "body"),
    updateUserById,
  )
  .delete(validateUserSelfPermission, deleteUserById);

export default router;
