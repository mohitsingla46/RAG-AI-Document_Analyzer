import "dotenv/config";
import { NomicEmbeddings } from "@langchain/nomic";

export const embeddings = new NomicEmbeddings();
