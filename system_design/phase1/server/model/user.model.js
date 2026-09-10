import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    pass: String
}, { timestamps: true })

const User = mongoose.model("User", userSchema)
export default User