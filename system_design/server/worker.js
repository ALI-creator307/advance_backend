import { Worker } from "bullmq";
import Redis from "ioredis";
import sendEmail from "./lib/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null
});

const worker = new Worker("emailQueue", async (job) => {
    console.log("job started for ID:", job.id);
    const email = job.data.email;
    await sendEmail(email);
    console.log("job completed for ID:", job.id);
}, { connection });

console.log("Worker is running and listening for jobs...");
