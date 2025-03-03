import "dotenv/config";
import { NomicEmbeddings } from "@langchain/nomic";

export const getEmbeddings = (taskType) => {
    return new NomicEmbeddings({
        model: "nomic-embed-text-v1.5",
        apiKey: process.env.NOMIC_API_KEY,
        taskType: taskType,
    });
};