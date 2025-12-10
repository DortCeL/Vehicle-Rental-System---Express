import { Request, Response } from "express"
import { BookingCreateDto } from "../../types/Booking"
import { bookingServices } from "./booking.service"

const createBooking = async (req: Request, res: Response) => {
    try {
        const {
            vehicle_id,
            rent_start_date,
            rent_end_date,
            customer_id,
        }: BookingCreateDto = req.body

        if (!vehicle_id || !rent_start_date || !rent_end_date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        // One trying to book can be - CUSTOMER / ADMIN
        // if customer, he can book with HIS OWN CUSTOMER_ID only. that case, he doesnt need to provide customer_id
        let proper_customerId: number

        if (req.user?.role === "customer") {
            proper_customerId = req.user?.id
        } else {
            // He is Admin. so he can use any customer_id. customer_id field is REQUIRED in this case
            if (!customer_id) {
                return res.status(400).json({
                    success: false,
                    message: "customer_id required",
                })
            }
            proper_customerId = Number(customer_id)
        }

        // Now we book
        const bookingResult = await bookingServices.createBooking({
            customer_id: proper_customerId,
            rent_end_date,
            rent_start_date,
            vehicle_id,
        })

        const { booking, vehicle } = bookingResult

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                ...booking,
                vehicle: {
                    vechicle_name: vehicle.vehicle_name,
                    daily_rent_price: vehicle.daily_rent_price,
                },
            },
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const getAllBookings = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            })
        }

        if (req.user?.role === "admin") {
            const bookings = await bookingServices.getAllBookings_Admin()

            res.status(200).json({
                success: true,
                message: "Bookings retrieved successfully",
                data: bookings.map((b) => ({
                    id: b.id,
                    customer_id: b.customer_id,
                    vehicle_id: b.vehicle_id,
                    rent_start_date: b.rent_start_date,
                    rent_end_date: b.rent_end_date,
                    total_price: b.total_price,
                    status: b.status,
                    customer: {
                        name: b.customer_name,
                        email: b.customer_email,
                    },
                    vehicle: {
                        vehicle_name: b.vehicle_name,
                        registration_number: b.registration_number,
                    },
                })),
            })
        } else {
            const bookings = await bookingServices.getAllBookings_Customer(
                req.user?.id
            )

            return res.status(200).json({
                success: true,
                message: "Your bookings retrieved successfully",
                data: bookings.map((b) => ({
                    id: b.id,
                    vehicle_id: b.vehicle_id,
                    rent_start_date: b.rent_start_date,
                    rent_end_date: b.rent_end_date,
                    total_price: b.total_price,
                    status: b.status,
                    vehicle: {
                        vehicle_name: b.vehicle_name,
                        registration_number: b.registration_number,
                        type: b.type,
                    },
                })),
            })
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

const updateBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params
        const { status }: { status: string } = req.body

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required",
            })
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            })
        }

        if (status !== "cancelled" && status !== "returned") {
            return res.status(400).json({
                success: false,
                message: "Status must be either 'cancelled' or 'returned'",
            })
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            })
        }

        // Validate status based on role
        if (req.user?.role === "customer" && status !== "cancelled") {
            return res.status(403).json({
                success: false,
                message: "Customers can only cancel bookings",
            })
        }

        if (req.user?.role === "admin" && status !== "returned") {
            return res.status(403).json({
                success: false,
                message: "Admins can only mark bookings as returned",
            })
        }

        if (req.user?.role !== "admin" && req.user?.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized role",
            })
        }

        // For customers, check if they own this booking
        if (req.user?.role === "customer") {
            const booking = await bookingServices.getBookingById(
                Number(bookingId)
            )

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                })
            }

            if (booking.customer_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "You can only cancel your own bookings",
                })
            }
        }

        // Update the booking
        const result = await bookingServices.updateBooking(
            Number(bookingId),
            status
        )

        // Format response based on status
        if (status === "returned") {
            const resultWithVehicle = result as typeof result & {
                vehicle?: { availability_status: string }
            }
            res.status(200).json({
                success: true,
                message: "Booking marked as returned. Vehicle is now available",
                data: {
                    id: result.id,
                    customer_id: result.customer_id,
                    vehicle_id: result.vehicle_id,
                    rent_start_date: result.rent_start_date,
                    rent_end_date: result.rent_end_date,
                    total_price: result.total_price,
                    status: result.status,
                    vehicle: {
                        availability_status:
                            resultWithVehicle.vehicle?.availability_status ||
                            "available",
                    },
                },
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Booking cancelled successfully",
                data: {
                    id: result.id,
                    customer_id: result.customer_id,
                    vehicle_id: result.vehicle_id,
                    rent_start_date: result.rent_start_date,
                    rent_end_date: result.rent_end_date,
                    total_price: result.total_price,
                    status: result.status,
                },
            })
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.message,
        })
    }
}

export const bookingController = {
    createBooking,
    getAllBookings,
    updateBooking,
}
