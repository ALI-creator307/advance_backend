import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null
});

const emailQueue = new Queue("emailQueue", { connection });

export default emailQueue;
