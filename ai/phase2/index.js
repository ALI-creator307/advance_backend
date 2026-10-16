import express from 'express';
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai';
import { ChatGroq } from '@langchain/groq';
import fs from "fs"
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

dotenv.config()

const app = express()
app.use(express.json())
const port = 5000


/**
 * - LLM
 */
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    maxTokens: 1000,
    maxRetries: 2
})


/**
 * - LANGGRAPH AI API
 */
app.post('/rag-ai', async (req, res) => {
    const { input } = req.body

    const response = await llm.invoke(input)

    return res.status(200).json({ "ai": response.content })
})

/**
 * - UPLOAD PDF
 */
const upload = async () => {
    const pdfPath = "./store.pdf"
    const buffer = fs.readFileSync(pdfPath)
    const pdfResult = new PDFParse({
        data: buffer
    })

    const result = await pdfResult.getText()
    const text = result.text

    // splitter
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000
    })
    const docs = await splitter.createDocuments([text])

    console.log(docs)
}

upload()


app.get('/', (req, res) => {
    return res.json({ message: "hello from AI dir" })
})

app.listen(port, () => {
    console.log("server started")
})