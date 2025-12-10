import { Request, Response } from "express"
import { vehicleServices } from "./vehicle.service"
import { VehicleCreateDto } from "../../types/Vehicle"

const createVehicle = async (req: Request, res: Response) => {
    const {
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
    }: VehicleCreateDto = req.body

    // Ensure all fields
    if (
        !vehicle_name ||
        !type ||
        !registration_number ||
        daily_rent_price === undefined ||
        !availability_status
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields required",
        })
    }

    try {
        const vehicle = await vehicleServices.createVehicle({
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status,
        })

        return res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const getAllVehicles = async (_req: Request, res: Response) => {
    try {
        const vehicles = await vehicleServices.getAllVehicles()

        if (vehicles.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No vehicles found",
                data: [],
            })
        }

        return res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: vehicles,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const getVehicleById = async (req: Request, res: Response) => {
    const vehicleId = Number(req.params.vehicleId)
    if (Number.isNaN(vehicleId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid vehicle id",
        })
    }
    try {
        const vehicle = await vehicleServices.getVehicleById(vehicleId)

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Vehicle retrieved by id successfully",
            data: vehicle,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const updateVehicle = async (req: Request, res: Response) => {
    const vehicleId = Number(req.params.vehicleId)
    if (Number.isNaN(vehicleId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid vehicle id",
        })
    }
    try {
        const updatedVehicle = await vehicleServices.updateVehicle(
            vehicleId,
            req.body
        )

        if (!updatedVehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: updatedVehicle,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

// CHECK FOR ERROR LATER
const deleteVehicle = async (req: Request, res: Response) => {
    const vehicleId = Number(req.params.vehicleId)

    if (Number.isNaN(vehicleId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid vehicle id",
        })
    }
    try {
        try {
            const deleted = await vehicleServices.deleteVehicle(vehicleId)

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Vehicle not found",
                })
            }

            return res.status(200).json({
                success: true,
                message: "Vehicle deleted successfully",
            })
        } catch (innerError: any) {
            if (
                innerError.message ===
                "Vehicle has active bookings and cannot be deleted"
            ) {
                return res.status(400).json({
                    success: false,
                    message: innerError.message,
                })
            }
            throw innerError
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

export const vehicleController = {
    createVehicle,
    deleteVehicle,
    getAllVehicles,
    updateVehicle,
    getVehicleById,
}
