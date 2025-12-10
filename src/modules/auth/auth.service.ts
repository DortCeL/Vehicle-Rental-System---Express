import pool from "../../config/db"
import { User, UserLoginDto, UserSignupDto } from "../../types/User"
import type { QueryResult } from "pg"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import config from "../../config"

const signup = async (payload: UserSignupDto) => {
    const { email, name, password, phone, role } = payload

    const hashedPassword = await bcrypt.hash(password, 10)

    const query = `INSERT INTO users(name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`
    const result: QueryResult<User> = await pool.query(query, [
        name,
        email,
        hashedPassword,
        phone,
        role,
    ])

    return result.rows[0] || null
}

const login = async (payload: UserLoginDto) => {
    const { email, password } = payload

    const query = `SELECT * FROM users WHERE email = $1`

    // find email match
    const result: QueryResult<User> = await pool.query(query, [email])
    if (result.rows.length === 0) {
        throw new Error("Invalid email or password")
    }

    // check password match
    const user = result.rows[0]
    const passwordIsMatch = await bcrypt.compare(password, user?.password!)
    if (!passwordIsMatch) {
        throw new Error("Invalid email or password")
    }

    // sign token
    const token = jwt.sign(
        {
            id: user?.id,
            email: user?.email,
            role: user?.role,
        },
        config.jwt_secret as string,
        { expiresIn: "7d" }
    )

    return { token, user }
}

export const authServices = { signup, login }
