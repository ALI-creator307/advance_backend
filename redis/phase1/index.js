import express from "express";
import dotenv from "dotenv";
import connectDb from "./lib/db.js";
dotenv.config();


const port = process.env.PORT || 5000

const app = express();

app.get('/', (req, res) => {
    return res.status(200).json({ msg: "route is workng" })
})

app.listen(port, () => {
    connectDb()
    console.log(`server is running on port ${port}`)
})