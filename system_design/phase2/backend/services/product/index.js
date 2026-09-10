import express from "express";
import dotenv from "dotenv";

dotenv.config();


const port = process.env.PORT || 8003

const app = express();

app.use(express.json())

app.get('/', (req, res) => {
    return res.status(200).json({ msg: "hello from Product service" })
})


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})