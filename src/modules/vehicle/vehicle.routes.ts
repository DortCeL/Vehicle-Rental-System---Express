import { Router } from "express"
import auth from "../../middleware/auth"
import { vehicleController } from "./vehicle.controller"

const router = Router()

router.get("/", vehicleController.getAllVehicles)
router.get("/:vehicleId", vehicleController.getVehicleById)

router.post("/", auth("admin"), vehicleController.createVehicle)
router.put("/:vehicleId", auth("admin"), vehicleController.updateVehicle)
router.delete("/:vehicleId", auth("admin"), vehicleController.deleteVehicle)

export const vehicleRoutes = router
