import express from "express";
import dotenv from "dotenv";
import connectDb from "./lib/db.js";
import User from "./model/user.model.js";
dotenv.config();


const port = process.env.PORT || 5000

const app = express();

app.use(express.json())

app.get('/', (req, res) => {
    return res.status(200).json({ msg: "route is workng" })
})

//make create api
app.post('/create', async (req, res) => {

    const { name, email, pass } = req.body;

    const user = await User.create({
        name, email, pass
    })

    return res.json(user)

})

//make get api
app.post('/create', async (req, res) => {

    const user = await User.find({})

    return res.json(user)

})

app.listen(port, () => {
    connectDb()
    console.log(`server is running on port ${port}`)
})