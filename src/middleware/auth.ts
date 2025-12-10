import { NextFunction, Request, Response } from "express"
import { Role, User } from "../types/User"
import jwt, { JwtPayload } from "jsonwebtoken"
import config from "../config"

const auth = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // check if authorization header is sent
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ message: "No authorization header" })
        }

        // omit "Bearer " from token
        const parts = authHeader.split(" ")
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid token format. use this: Bearer <token>",
            })
        }
        const token = parts[1]

        // check if token exists
        if (!token) {
            return res.status(401).json({
                message: "No token provided",
            })
        }

        // decode the token
        const decoded = jwt.verify(
            token,
            config.jwt_secret as string
        ) as JwtPayload

        // include the user info inside REQUEST
        req.user = decoded

        console.log({
            decoded,
            reqBody_user: req.user,
            message: "Authentication Used!",
        })

        // Check role permission
        if (roles.length && !roles.includes(decoded.role)) {
            return res.status(403).json({
                message: "Unauthorized access. Insufficient permission",
            })
        }

        next()
    }
}

export default auth
