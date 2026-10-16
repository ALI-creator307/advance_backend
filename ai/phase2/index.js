import express from 'express';
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai';
import { ChatGroq } from '@langchain/groq';
import fs from "fs"
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import {QdrantVectorStore} from "@langchain/qdrant"
import { HumanMessage } from '@langchain/core/messages';

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
 * - Embedding
 */
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});


const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "advance-ai",
});


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
        chunkSize: 500,
    })
    const docs = await splitter.createDocuments([text])

    await vectorStore.addDocuments(docs)

    console.log(docs)
}

upload()

/**
 * - LANGGRAPH AI API
 */
app.post('/rag-ai', async (req, res) => {
    const { input } = req.body

    const docs = await vectorStore.similaritySearch(input, 5)
    const context = docs.map((d) => d.pageContent).join("/n")

    const response = await llm.invoke([
        {
            role: "system",
            content: `You are a RAG AI assistant.
                STRICT RULES:
                - Answer ONLY from context
                Do not use outside knowledge
                If answer not found say:
                "I don't know from uploaded PDF."
                Context:${context}`
        },
        new HumanMessage(input)
    ])

    return res.status(200).json({ai: response.content})
})


app.get('/', (req, res) => {
    return res.json({ message: "hello from AI dir" })
})

app.listen(port, () => {
    console.log("server started")
})