import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { embeddings } from "@/app/backend/config/embeddings.js";
import { searchVectorStore } from "./vectorStore.js";

const retrieveSchema = z.object({ query: z.string() });

export const retrieve = tool(
    async ({ query }) => {
        const queryEmbedding = await embeddings.embedQuery(query);

        try {
            const searchResults = await searchVectorStore(queryEmbedding);

            if (!Array.isArray(searchResults)) {
                throw new Error("Search results are not an array. Check vector store.");
            }

            const retrievedDocs = searchResults.map(result => ({
                pageContent: result.text,
                metadata: {
                    source: result.source,
                    pageNumber: result.pageNumber,
                }
            }));

            const serialized = retrievedDocs
                .map(doc => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
                .join("\n");

            return [serialized, retrievedDocs];
        } catch (error) {
            console.error("Error in retrieve function:", error);
            throw new Error("Error retrieving documents.");
        }
    },
    {
        name: "retrieve",
        description: "Retrieve information related to a query.",
        schema: retrieveSchema,
        responseFormat: "content_and_artifact",
    }
);
