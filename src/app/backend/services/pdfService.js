import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { saveToVectorStore } from "@/app/backend/services/vectorStore.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

export const processPDF = async (file, userId) => {
    try {
        if (!file) {
            throw new Error("File is required");
        }

        // Convert Blob to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create a temporary file
        const tempFilePath = path.join(os.tmpdir(), file.name);
        await fs.writeFile(tempFilePath, buffer);

        // Load PDF from temp file
        const loader = new PDFLoader(tempFilePath);
        const docs = await loader.load();
        const allSplits = await splitter.splitDocuments(docs);

        // Save to vector store
        const vectorStore = await saveToVectorStore(allSplits, file.name, userId);

        // Clean up: Remove temp file after processing
        await fs.unlink(tempFilePath);

        return { message: "PDF processed successfully", vectorStore };
    } catch (error) {
        console.error("Error processing PDF:", error);
        throw new Error("Failed to process PDF");
    }
};
