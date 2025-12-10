import { QueryResult } from "pg"
import pool from "../../config/db"
import {
    Vehicle,
    VehicleCreateDto,
    VehicleUpdateDto,
} from "../../types/Vehicle"

const createVehicle = async (payload: VehicleCreateDto) => {
    const {
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
    } = payload

    const query = `
        INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `

    const result: QueryResult<Vehicle> = await pool.query(query, [
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
    ])

    return result.rows[0]
}

const getAllVehicles = async () => {
    const query = `
        SELECT * FROM vehicles ORDER BY id
    `

    const result: QueryResult<Vehicle> = await pool.query(query)
    return result.rows
}

const getVehicleById = async (id: number) => {
    const query = `
        SELECT * FROM vehicles WHERE id = $1
    `

    const result: QueryResult<Vehicle> = await pool.query(query, [id])
    return result.rows[0] || null
}

const updateVehicle = async (id: number, payload: VehicleUpdateDto) => {
    const {
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
    } = payload

    const query = `
        UPDATE vehicles
        SET
            vehicle_name = COALESCE($1, vehicle_name),
            type = COALESCE($2, type),
            registration_number = COALESCE($3, registration_number),
            daily_rent_price = COALESCE($4, daily_rent_price),
            availability_status = COALESCE($5, availability_status)
        WHERE id = $6
        RETURNING *
    `

    const result: QueryResult<Vehicle> = await pool.query(query, [
        vehicle_name ?? null,
        type ?? null,
        registration_number ?? null,
        daily_rent_price ?? null,
        availability_status ?? null,
        id,
    ])

    return result.rows[0] || null
}

const deleteVehicle = async (id: number) => {
    // Chech if vehicle is booked or not
    let query = `
      SELECT id FROM bookings
      WHERE vehicle_id = $1 AND status = 'active'
    `
    const bookingCheck: QueryResult<{ id: number }> = await pool.query(query, [
        id,
    ])

    if (bookingCheck.rows.length > 0) {
        throw new Error("Vehicle is currently booked. Cannot delete!")
    }

    // delete vehicle because its not booked
    query = `DELETE FROM vehicles WHERE id = $1 RETURNING *`
    const result: QueryResult<Vehicle> = await pool.query(query, [id])

    return result.rows[0] || null
}

export const vehicleServices = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
}
