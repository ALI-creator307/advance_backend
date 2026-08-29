import express from "express";
import dotenv from "dotenv";
dotenv.config();


const port = process.env.PORT || 5000

const app = express();

app.get('/', (req, res) => {
    return res.status(200).json({ msg: "route is workng" })
})

app.listen(port, () => {
    console.log(`server of phase 2 is running on port ${port}`)
})