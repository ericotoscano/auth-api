import { Router } from "express";
import { validateSchema } from "../middlewares/validation.middlewares";
import {
  deleteUserById,
  findAllUsers,
  findUserById,
  updateUserById,
} from "../controllers/user.controller";
import { findAllUsersSchema, updateUserSchema } from "../schemas/user.schemas";
import { validateToken } from "../middlewares/auth.middlewares";
import { authorizationSchema } from "../schemas/token.schemas";
import { validateUserSelfPermission } from "../middlewares/user.middlewares";
import { userIdSchema } from "../schemas/id.schema";

const router = Router();

router.get(
  "/",
  validateSchema(authorizationSchema, "headers"),
  validateToken("access"),
  validateSchema(findAllUsersSchema, "query"),
  findAllUsers
);

router
  .route("/:userId")
  .all(
    validateSchema(authorizationSchema, "headers"),
    validateToken("access"),
    validateSchema(userIdSchema, "params")
  )
  .get(findUserById)
  .patch(
    validateUserSelfPermission,
    validateSchema(updateUserSchema, "body"),
    updateUserById
  )
  .delete(validateUserSelfPermission, deleteUserById);

export default router;
