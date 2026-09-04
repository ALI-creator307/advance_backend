import mongoose from "mongoose"
import dns from "node:dns"

dns.setServers(["8.8.8.8", "8.8.4.4"])

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("db connected")
    } catch (error) {
        console.log(error)
    }
}

export default connectDb;