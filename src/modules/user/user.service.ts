import { QueryResult } from "pg"
import { User, UserUpdateDto } from "../../types/User"
import pool from "../../config/db"

const getAllUsers = async () => {
    const query = `SELECT id, name, email, phone, role FROM users ORDER BY id`
    const result: QueryResult<User> = await pool.query(query)
    return result.rows
}

const updateUser = async (id: number, payload: UserUpdateDto) => {
    const { name, email, phone, role } = payload
    const query = `
        UPDATE users
            SET name = COALESCE($1, name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                role = COALESCE($4, role)
            WHERE id = $5 RETURNING *`

    const result: QueryResult<User> = await pool.query(query, [
        name ?? null,
        email ?? null,
        phone ?? null,
        role ?? null,
        id,
    ])

    return result.rows[0] || null
}

const deleteUser = async (id: number) => {
    const bookingCheck = await pool.query(
        `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
        [id]
    )

    if (bookingCheck.rows.length > 0) {
        throw new Error("User has active bookings and cannot be deleted")
    }

    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING id`,
        [id]
    )

    return result.rows[0] || null
}

export const userServices = { getAllUsers, updateUser, deleteUser }
