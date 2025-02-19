import clientPromise from "@/app/lib/mongodb";
import { embeddings } from "@/app/backend/config/embeddings.js";

const COLLECTION_NAME = "pdf_docs";

export const saveToVectorStore = async (splitDocs, source, userId) => {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    await collection.deleteMany({ userId });

    const vectors = await Promise.all(
        splitDocs.map(async (doc) => ({
            userId,
            vector: await embeddings.embedQuery(doc.pageContent),
            text: doc.pageContent,
            source: source,
            pageNumber: doc.metadata.loc?.pageNumber || null,
        }))
    );

    await collection.insertMany(vectors);
};

export const searchVectorStore = async (queryEmbedding, userId, limit = 2) => {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    try {
        return await collection
            .aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        queryVector: queryEmbedding,
                        path: "vector",
                        numCandidates: limit,
                        limit: limit,
                    },
                },
                { $match: { userId } },
            ])
            .toArray();
    } catch (error) {
        throw new Error("Vector store not initialized. Upload a PDF first.");
    }
};

export const checkTableExists = async (userId) => {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);

    return (await collection.countDocuments({ userId })) > 0;
};
