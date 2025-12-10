export interface BookingCreateDto {
    customer_id: number
    vehicle_id: number
    rent_start_date: string
    rent_end_date: string
}

export interface Booking extends BookingCreateDto {
    id: number
    total_price: number
    status: BookingStatus
}

export type BookingStatus = "active" | "cancelled" | "returned"
