import { Request, Response } from "express"
import { authServices } from "./auth.service"

const signup = async (req: Request, res: Response) => {
    try {
        const newUser = await authServices.signup(req.body)

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const loginResponse = await authServices.login(req.body)

        res.status(201).json({
            success: true,
            message: "Logged in successfully",
            data: loginResponse,
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

export const authController = { signup, login }
