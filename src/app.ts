import express from "express"
import { initDB } from "./config/db"
import { authRoutes } from "./modules/auth/auth.routes"
import { userRoutes } from "./modules/user/user.routes"
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes"
import { bookingRoutes } from "./modules/booking/booking.routes"

const app = express()
app.use(express.json())

// Initialize database
initDB()

// Middleware

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello from backend",
    })
})

// Routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/vehicles", vehicleRoutes)
app.use("/api/v1/bookings", bookingRoutes)

export default app
