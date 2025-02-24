import clientPromise from "@/app/lib/mongodb";
import { embeddings } from "@/app/backend/config/embeddings.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const VECTOR_COLLECTION = "pdf_vectors";
const FILE_COLLECTION = "pdf_files";

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

export const searchVectorStore = async (queryEmbedding, limit = 2) => {
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

export const deletePDF = async (userId) => {
    const client = await clientPromise;
    const db = client.db();
    const vectorCollection = db.collection(VECTOR_COLLECTION);
    const fileCollection = db.collection(FILE_COLLECTION);

    try {
        await vectorCollection
            .deleteMany({ userId });
        return await fileCollection
            .deleteMany({ userId });
    } catch (error) {
        console.error("Error deleting PDF:", error);
        throw new Error("Failed to delete PDF.");
    }
}
