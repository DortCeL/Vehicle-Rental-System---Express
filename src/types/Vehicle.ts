export interface VehicleCreateDto {
    vehicle_name: string
    type: "car" | "bike" | "van" | "SUV"
    registration_number: string
    daily_rent_price: number
    availability_status: "available" | "booked"
}

export interface Vehicle extends VehicleCreateDto {
    id: number
}

export interface VehicleUpdateDto {
    vehicle_name?: string
    type?: "car" | "bike" | "van" | "SUV"
    registration_number?: string
    daily_rent_price?: number
    availability_status?: "available" | "booked"
}
