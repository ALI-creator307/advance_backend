import express from "express";
import dotenv from "dotenv";
import connectDb from "./lib/db.js";
import User from "./model/user.model.js";
import Redis from "ioredis";
dotenv.config();


const port = process.env.PORT || 5000


const redis = new Redis(process.env.REDIS_URL)
const app = express();

app.use(express.json())

app.get('/', (req, res) => {
    return res.status(200).json({ msg: "route is workng" })
})

//make create api
app.post('/create', async (req, res) => {

    await redis.del("user:all")
    const { name, email, pass } = req.body;

    const user = await User.create({
        name, email, pass
    })

    return res.json(user)

})

//make get api
app.get('/get', async (req, res) => {

    const user = await User.find({})

    return res.json(user)

})

//make redis get api
app.get('/redis-get', async (req, res) => {

    const cache = await redis.get("user:all")

    if (cache) {
        const user = JSON.parse(cache)
        return res.json(user)
    }

    const user = await User.find({})
    await redis.set("user:all", JSON.stringify(user))

    return res.json(user)

})

app.listen(port, () => {
    connectDb()
    console.log(`server is running on port ${port}`)
})