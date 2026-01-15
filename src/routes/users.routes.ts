import { Router } from "express";
import { validateSchema } from "../middlewares/validation.middlewares";
import {
  deleteUserById,
  findAllUsers,
  findUserById,
  updateUserById,
} from "../controllers/users.controller";
import {
  findAllUsersSchema,
  updateUserSchema,
  userIdSchema,
} from "../schemas/users.schemas";
import { validateToken } from "../middlewares/auth.middlewares";
import { validateUserSelfPermission } from "../middlewares/users.middlewares";

const router = Router();

router.get(
  "/",
  validateToken("access"),
  validateSchema(findAllUsersSchema, "query"),
  findAllUsers
);

router
  .route("/:id")
  .all(validateToken("access"), validateSchema(userIdSchema, "params"))
  .get(findUserById)
  .patch(
    validateUserSelfPermission,
    validateSchema(updateUserSchema, "body"),
    updateUserById
  )
  .delete(validateUserSelfPermission, deleteUserById);

export default router;
