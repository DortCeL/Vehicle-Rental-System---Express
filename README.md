## Vehicle Rental System

Live URL: https://vehicle-rental-system-express-six.vercel.app

### Overview

A RESTful vehicle rental backend with role-based access, bookings, and vehicle management.

### Features

-   Authentication: JWT-based login, role (admin/customer) enforcement.
-   Vehicles: list/create/update availability.
-   Bookings: create, list (by role), cancel (customer), return (admin).
-   Validation: rent-date checks, vehicle availability checks.
-   DB: PostgreSQL integration.

### Technology Stack

-   Runtime: Node.js
-   Framework: Express
-   Language: TypeScript
-   Database: PostgreSQL on NeonDB
-   Deployment: Vercel serverless (`@vercel/node`)

### Setup

1. Install dependencies: `npm install`
2. Env vars (example):
    - `PORT=<port>` (required for dev mode)
    - `CONN_STR=<neonDB-connection-string>`
    - `JWT_SECRET=<secret>`
3. Build: `npm run build`
4. Run locally: `npm run start` (or `npm run dev` for dev mode)

### Usage (API)

-   Base path: `/api/v1`
-   Auth header: `Authorization: Bearer <token>`

Auth

-   `POST /auth/signup` — create account
-   `POST /auth/signin` — login

Users

-   `GET /users` — list users (admin)
-   `PUT /users/:userId` — update user info (admin or profile owner)
-   `DELETE /users/:userId` — delete user (admin)

Vehicles

-   `GET /vehicles` — list all vehicles
-   `GET /vehicles/:vehicleId` — get vehicle by id
-   `POST /vehicles` — add vehicle (admin)
-   `PUT /vehicles/:vehicleId` — update vehicle info (admin)
-   `DELETE /vehicles/:vehicleId` — delete vehicle (admin)

Bookings

-   `POST /bookings` — create booking
-   `GET /bookings` — list bookings (admin: all, customer: own)
-   `PUT /bookings/:bookingId` — update booking status (customer - own, admin - all)

---
