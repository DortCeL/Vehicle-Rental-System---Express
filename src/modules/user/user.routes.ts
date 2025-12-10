import { Router } from "express"
import { userController } from "./user.controller"
import auth from "../../middleware/auth"

const router = Router()

router.get("/", auth("admin"), userController.getAllUsers)
router.put("/:userId", auth("admin", "customer"), userController.updateUser)
router.delete("/:userId", auth("admin"), userController.deleteUser)

export const userRoutes = router
