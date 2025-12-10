import { QueryResult } from "pg"
import { Booking, BookingCreateDto } from "../../types/Booking"
import pool from "../../config/db"
import { Vehicle } from "../../types/Vehicle"

const createBooking = async (payload: BookingCreateDto) => {
    const { customer_id, rent_end_date, rent_start_date, vehicle_id } = payload

    // check if vehicle with vehicle_id exists AND available
    const vehicleResult: QueryResult<Vehicle> = await pool.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [vehicle_id]
    )
    const vehicle = vehicleResult.rows[0]

    if (!vehicle) {
        throw new Error("Vehicle not found")
    }

    // check status of that vehicle
    if (vehicle.availability_status !== "available") {
        throw new Error("Vehicle is not available for booking")
    }
    // Now we know vehicle can be booked

    // check rent dates
    const start = new Date(rent_start_date)
    const end = new Date(rent_end_date)

    // Dates must be valid and end must be after start
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        throw new Error("Invalid rent dates")
    }

    // count total rent
    const msPerDay = 1000 * 60 * 60 * 24
    const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / msPerDay)

    const total_price = Number(vehicle.daily_rent_price) * numberOfDays

    const bookingResult: QueryResult<Booking> = await pool.query(
        `
            INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
            VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *
        `,
        [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    )

    const booking = bookingResult.rows[0]

    if (!booking) {
        throw new Error("Booking failed!")
    }

    // Finally change that vehicle's availability_status to "booked"
    await pool.query(
        `
          UPDATE vehicles
          SET availability_status = 'booked'
          WHERE id = $1
        `,
        [vehicle_id]
    )

    return { booking, vehicle }
}

// customer and admin er jonno alada
const getAllBookings_Admin = async () => {
    const bookingResult = await pool.query(
        `
        SELECT
            b.id,
            b.customer_id,
            b.vehicle_id,
            b.rent_start_date,
            b.rent_end_date,
            b.total_price,
            b.status,
            u.name AS customer_name,
            u.email AS customer_email,
            v.vehicle_name,
            v.registration_number
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        ORDER BY b.id
      `
    )
    return bookingResult.rows
}
// customer and admin er jonno alada
const getAllBookings_Customer = async (customerId: number) => {
    const result = await pool.query(
        `
          SELECT
            b.id,
            b.vehicle_id,
            b.rent_start_date,
            b.rent_end_date,
            b.total_price,
            b.status,
            v.vehicle_name,
            v.registration_number,
            v.type
          FROM bookings b JOIN vehicles v ON b.vehicle_id = v.id
          WHERE b.customer_id = $1 ORDER BY b.id
        `,
        [customerId]
    )

    return result.rows
}

const getBookingById = async (bookingId: number) => {
    const result: QueryResult<Booking> = await pool.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [bookingId]
    )
    return result.rows[0] || null
}

const updateBooking = async (
    bookingId: number,
    status: "cancelled" | "returned"
) => {
    const foundBookingResult: QueryResult<Booking> = await pool.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [bookingId]
    )
    const foundBooking = foundBookingResult.rows[0]

    if (!foundBooking) {
        throw new Error("Booking not found")
    }

    // Check if current time is before rent_start_date (only for cancellations)
    // Admin can mark as "returned" even after start date
    if (status === "cancelled") {
        const now = new Date()
        const rentStartDate = new Date(foundBooking.rent_start_date)

        if (now >= rentStartDate) {
            throw new Error(
                "Cannot cancel booking: rent period has already started"
            )
        }
    }

    // Update booking status
    const result: QueryResult<Booking> = await pool.query(
        `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
        [status, bookingId]
    )

    const updatedBooking = result.rows[0]

    if (!updatedBooking) {
        throw new Error("Failed to update booking")
    }

    // Update vehicle availability to "available" when booking is cancelled or returned
    await pool.query(
        `
          UPDATE vehicles
          SET availability_status = 'available'
          WHERE id = $1
        `,
        [foundBooking.vehicle_id]
    )

    // If status is "returned", also return vehicle info
    if (status === "returned") {
        const vehicleResult: QueryResult<Vehicle> = await pool.query(
            `SELECT availability_status FROM vehicles WHERE id = $1`,
            [foundBooking.vehicle_id]
        )
        const vehicle = vehicleResult.rows[0]

        return { ...updatedBooking, vehicle }
    }

    return updatedBooking
}

export const bookingServices = {
    createBooking,
    getAllBookings_Admin,
    getAllBookings_Customer,
    getBookingById,
    updateBooking,
}
