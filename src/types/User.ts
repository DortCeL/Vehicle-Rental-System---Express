export type Role = "admin" | "customer"

export interface User extends UserSignupDto {
    id: number
}

export interface UserSignupDto {
    name: string
    email: string
    password: string
    phone: string
    role: Role
}

export interface UserLoginDto {
    email: string
    password: string
}

export interface UserUpdateDto {
    name?: string
    email?: string
    phone?: string
    role?: Role
}
