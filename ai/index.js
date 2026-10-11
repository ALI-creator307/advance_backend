import express from 'express';
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai';
import { ChatGroq } from '@langchain/groq'
import { addMessages, Annotation, MemorySaver, MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
dotenv.config()

const app = express()
app.use(express.json())
const port = 5000

// Without LANGCHAIN

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// })

// const main = async () => {
//     const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: "what is java and explain in short about java"
//     })

//     console.log(response.text)
// }

// app.post('/ai', async (req, res) => {
//     const { input } = req.body
//     const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: [
//             {
//                 role: 'system',
//                 parts: [{ text: "you are a senior software engineer at TECHLABS ,your name is ZEGAN and your work is to guide beginners how the AI SYSTEM works what are LLMs, you only guide user in these particular languages => java, c++, python and javascript just these in case of other you just gave warning i don't have knowledge about that sorry this type of response but better than my way. behave like senor experienced developer" }]
//             },
//             {
//                 role: 'user',
//                 parts: [{ text: input }]
//             }

//         ]
//     })

//     return res.status(200).json(response.text)

// })


// With LANGCHAIN

// const llm = new ChatGroq({
//     model: "openai/gpt-oss-120b",
//     temperature: 0.7,
//     maxTokens: 3000,
//     maxRetries: 2
// })


/**
 * - LANGCHAIN AI API
 */
app.post('/ai', async (req, res) => {
    const { input } = req.body
    const response = await llm.invoke([
        {
            role: 'system',
            content: "you are a senior software engineer at TECHLABS ,your name is ZEGAN and use tools where needed"
        },
        {
            role: 'human',
            content: input
        }
    ])

    return res.status(200).json(response.content)

})


/**
 * - LANGGRAPH
 */

// const State = Annotation.Root({
//     prompt: Annotation(),
//     aiMsg: Annotation()
// })

/**
 * - TAVILY AI
 */
const tool = new TavilySearch({
    maxResults: 5,
    topic: "general",
});

/**
 * - MEMORY SAVER
 */
const memory = new MemorySaver()

/**
 * - Tools Array
 */

const tools = [tool]
const toolNode = new ToolNode(tools)


/**
 * - LLM
 */
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    maxTokens: 1000,
    maxRetries: 2
}).bindTools(tools)

/**
 * - Funtion to call LLM
 */

const callLLM = async (state) => {
    console.log("state: ", state)

    const response = await llm.invoke([
        {
            role: 'system',
            content: "you are a senior software engineer at TECHLABS ,your name is ZEGAN nad use tools where needed"
        },
        ...state.messages
    ])

    return { messages: [response] }

}

/**
 * - Function for Conditional Edge
 */
const shouldContinue = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1]

    if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        return "tools"
    } else {
        return "__end__"
    }

}

const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callLLM)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .compile({checkpointer: memory})

/**
 * - LANGGRAPH AI API
 */
app.post('/langgraph-ai', async (req, res) => {
    try {
        const { input, thread_id } = req.body

        // Har new chat ke liye dynamic thread ya custom thread_id use karein
        const currentThread = thread_id || `user_${Date.now()}`

        const response = await graph.invoke({
            messages: [
                {
                    role: "user",
                    content: input
                }
            ]
        }, { configurable: { thread_id: currentThread } })

        return res.status(200).json({ "ai": response.messages[response.messages.length - 1].content })
    } catch (error) {
        console.error("API Error: ", error)
        return res.status(500).json({ error: error.message })
    }
})

app.get('/', (req, res) => {
    return res.json({ message: "hello from AI dir" })
})

app.listen(port, () => {
    console.log("server started")
})