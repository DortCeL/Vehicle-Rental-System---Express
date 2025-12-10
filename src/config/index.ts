import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env") })

const config = {
    port: process.env.PORT,
    conn_str: process.env.CONN_STR,
    jwt_secret: process.env.JWT_SECRET,
}

export default config
