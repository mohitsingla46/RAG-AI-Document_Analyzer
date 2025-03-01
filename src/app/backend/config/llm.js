import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

export const llm = new ChatGroq({
    model: "llama3-70b-8192",
    temperature: 0,
    maxRetries: 2,
});
