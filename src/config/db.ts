import { Pool } from "pg"
import config from "."

const pool = new Pool({
    connectionString: config.conn_str,
})

// Create the tables
export const initDB = async () => {
    // Create users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE
                CONSTRAINT email_lowercase CHECK (email = LOWER(email)),
            password TEXT NOT NULL 
                CONSTRAINT passowrd_length CHECK (char_length(password) >= 6),
            phone VARCHAR(20) NOT NULL,
            role VARCHAR(20) NOT NULL 
                CONSTRAINT user_role CHECK (role IN ('admin', 'customer'))
        )    
    `)

    // create vehicles table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles(
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL
                CONSTRAINT vehicle_type CHECK (type in ('car', 'bike', 'van', 'SUV')),
            registration_number VARCHAR(50) NOT NULL UNIQUE,
            daily_rent_price INT NOT NULL 
                CONSTRAINT positive_rent CHECK (daily_rent_price >= 0),
            availability_status VARCHAR(20) NOT NULL
                CONSTRAINT availability_constraint CHECK (availability_status IN ('available', 'booked'))
        )    
    `)

    // create bookings table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings(
            id SERIAL PRIMARY KEY,
            customer_id INT NOT NULL,
            vehicle_id INT NOT NULL,
            rent_start_date DATE NOT NULL,
            rent_end_date DATE NOT NULL
                CONSTRAINT end_after_start CHECK (rent_end_date > rent_start_date),
            total_price NUMERIC(10,2) NOT NULL
                CONSTRAINT positive_price CHECK (total_price >= 0),
            status VARCHAR(20) NOT NULL 
                CONSTRAINT status_constraint CHECK (status IN ('active' ,'cancelled', 'returned')),

            
            CONSTRAINT fk_customer
                FOREIGN KEY (customer_id) REFERENCES users(id),
            CONSTRAINT fk_vehicle
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
        )    
    `)
}

export default pool
