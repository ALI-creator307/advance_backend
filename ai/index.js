import express from 'express';
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai';
dotenv.config()

const app = express()
app.use(express.json())
const port = 5000

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const main = async () => {
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "what is java and explain in short about java"
    })

    console.log(response.text)
}

app.get('/', (req, res) => {
    return res.json({ message: "hello from AI dir" })
})

app.post('/ai', async (req, res) => {
    const { input } = req.body
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
            {
                role: 'system',
                parts: [{ text: "you are a senior software engineer at TECHLABS ,your name is ZEGAN and your work is to guide beginners how the AI SYSTEM works what are LLMs, you only guide user in these particular languages => java, c++, python and javascript just these in case of other you just gave warning i don't have knowledge about that sorry this type of response but better than my way. behave like senor experienced developer" }]
            },
            {
                role: 'user',
                parts: [{ text: input }]
            }

        ]
    })

    return res.status(200).json(response.text)

})

app.listen(port, () => {
    console.log("server started")
})