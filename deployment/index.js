import express, { json } from "express";
import dotenv from "dotenv";
dotenv.config()

const port = process.env.PORT || 5000

const app = express()


app.get('/health', (res, req) => {
    return res.status(200).json({message: "all is good"})
})

app.get('/', () => {
    return res.status(200).json({message: "hello ALI"})
})

app.listen(port, () => {
    console.log(`server started ${port}`)
})