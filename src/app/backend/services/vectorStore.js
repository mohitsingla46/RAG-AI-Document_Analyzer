import clientPromise from "@/app/lib/mongodb";
import { embeddings } from "@/app/backend/config/embeddings.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/backend/lib/auth";

const VECTOR_COLLECTION = "pdf_vectors";
const FILE_COLLECTION = "pdf_files";
const CHAT_COLLECTION = "chat_history";

export const saveToVectorStore = async (splitDocs, source, userId) => {
    const client = await clientPromise;
    const db = client.db();
    const vectorCollection = db.collection(VECTOR_COLLECTION);
    const fileCollection = db.collection(FILE_COLLECTION);

    try {
        const vectorDeleteResult = await vectorCollection.deleteMany({ userId });
        const fileDeleteResult = await fileCollection.deleteMany({ userId });
        console.log(`Deleted ${vectorDeleteResult.deletedCount} vectors and ${fileDeleteResult.deletedCount} file records`);

        await fileCollection.insertOne({
            userId,
            source,
            uploadedAt: new Date()
        });
        console.log(`Saved file record for ${source}`);

        const vectors = await Promise.all(
            splitDocs.map(async (doc) => {
                try {
                    const vector = await embeddings.embedQuery(doc.pageContent);
                    const EXPECTED_DIMENSIONS = 768;
                    if (!Array.isArray(vector) || vector.length !== EXPECTED_DIMENSIONS) {
                        throw new Error(`Invalid vector: expected ${EXPECTED_DIMENSIONS} dimensions, got ${vector?.length}`);
                    }
                    return {
                        userId,
                        vector,
                        text: doc.pageContent,
                        source,
                        pageNumber: doc.metadata.loc?.pageNumber || null,
                        createdAt: new Date()
                    };
                } catch (error) {
                    console.error("Error embedding document:", error);
                    return null;
                }
            })
        );

        const validVectors = vectors.filter(v => v !== null);
        if (validVectors.length === 0) {
            throw new Error("No valid vectors created");
        }

        const BATCH_SIZE = 100;
        for (let i = 0; i < validVectors.length; i += BATCH_SIZE) {
            const batch = validVectors.slice(i, i + BATCH_SIZE);
            await vectorCollection.insertMany(batch);
            console.log(`Inserted batch of ${batch.length} vectors`);
        }

        console.log(`Saved ${validVectors.length} vectors`);
        return validVectors.length;
    } catch (error) {
        console.error("Error saving to vector store:", error);
        throw error;
    }
};

export const searchVectorStore = async (queryEmbedding) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(VECTOR_COLLECTION);

    try {
        const results = await collection.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    queryVector: queryEmbedding,
                    path: "vector",
                    numCandidates: 100,
                    limit: 5,
                }
            },
            { $match: { userId } }
        ]).toArray();

        console.log(`Found ${results.length} results for userId: ${userId}`);
        return results;
    } catch (error) {
        console.error("Vector search error:", error);
        throw new Error("Vector store not initialized.");
    }
};

export const fetchUserPDFs = async (userId) => {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(FILE_COLLECTION);

    try {
        return await collection
            .find({ userId })
            .sort({ uploadedAt: -1 })
            .toArray();
    } catch (error) {
        console.error("Error fetching PDFs:", error);
        throw new Error("Failed to fetch PDFs.");
    }
};

export const deletePDF = async (userId, deleteChat = true) => {
    const client = await clientPromise;
    const db = client.db();
    const vectorCollection = db.collection(VECTOR_COLLECTION);
    const fileCollection = db.collection(FILE_COLLECTION);

    try {
        await vectorCollection.deleteMany({ userId });
        const fileDeleteResult = await fileCollection.deleteMany({ userId });

        if (deleteChat) {
            await deleteChatHistory(userId);
        }

        return fileDeleteResult;
    } catch (error) {
        console.error("Error deleting PDF:", error);
        throw new Error("Failed to delete PDF.");
    }
}

export const saveChatMessage = async (userId, threadId, role, content) => {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(CHAT_COLLECTION);
    const timestamp = new Date().toISOString();

    await collection.insertOne({
        userId,
        threadId,
        role,
        content,
        timestamp
    });
}

export const getChatHistory = async (userId, threadId) => {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(CHAT_COLLECTION);

    const messages = await collection
        .find({ userId, threadId })
        .sort({ timestamp: 1 })
        .toArray();

    return messages.map(msg => ({
        sender: msg.role,
        message: msg.content,
        timestamp: msg.timestamp
    }));
};

export const deleteChatHistory = async (userId, threadId = null) => {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(CHAT_COLLECTION);

    const query = { userId };
    if (threadId) {
        query.threadId = threadId;
    }

    const result = await collection.deleteMany(query);
    return result;
};
