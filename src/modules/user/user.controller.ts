import { Request, Response } from "express"
import { userServices } from "./user.service"

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userServices.getAllUsers()

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId)
        if (Number.isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            })
        }

        // Check if own profile or not
        if (req.user?.role === "customer" && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Denied! You can only update your own profile",
            })
        }

        const updated = await userServices.updateUser(userId, req.body)

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updated,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId)

        if (Number.isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            })
        }

        try {
            const deleted = await userServices.deleteUser(userId)

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                })
            }

            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
            })
        } catch (innerError: any) {
            if (innerError.message.includes("active bookings")) {
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

export const userController = { getAllUsers, updateUser, deleteUser }
