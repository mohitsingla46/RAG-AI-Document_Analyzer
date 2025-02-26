import clientPromise from "@/app/lib/mongodb";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BaseCheckpointSaver } from "@langchain/langgraph";

class MongoDBCheckpointSaver extends BaseCheckpointSaver {
    constructor() {
        super();
        this.collectionName = "checkpoints";
    }

    getDefaultCheckpoint() {
        return {
            v: 1,
            id: Date.now().toString(),
            ts: new Date().toISOString(),
            channel_values: {
                messages: [],
                __input__: null,
            },
            channel_versions: {},
            versions_seen: {},
            pending_sends: [],
        };
    }

    async getTuple(config) {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(this.collectionName);

        const threadId = config.configurable.thread_id;
        const checkpointDoc = await collection.findOne({ threadId });

        if (!checkpointDoc) {
            return null;
        }

        const checkpoint = {
            ...this.getDefaultCheckpoint(),
            ...checkpointDoc.state,
            channel_values: {
                ...this.getDefaultCheckpoint().channel_values,
                ...(checkpointDoc.state?.channel_values || {}),
                messages: (checkpointDoc.state?.channel_values?.messages || []).map(msg => {
                    if (msg.role === "human") return new HumanMessage({ content: msg.content });
                    if (msg.role === "assistant") return new AIMessage({ content: msg.content });
                    return new HumanMessage({ content: msg.content }); // Default to human if unknown
                }),
            },
        };

        return {
            config: {
                configurable: {
                    thread_id: checkpointDoc.threadId,
                },
            },
            checkpoint,
            metadata: checkpointDoc.metadata || {},
            parentConfig: checkpointDoc.parentConfig || null,
        };
    }

    async put(config, checkpoint, metadata) {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(this.collectionName);

        const threadId = config.configurable.thread_id;
        const timestamp = new Date();

        const existingDoc = await collection.findOne({ threadId });
        const existingMessages = existingDoc?.state?.channel_values?.messages || [];
        const newMessages = checkpoint?.channel_values?.messages || [];

        const updatedCheckpoint = {
            ...this.getDefaultCheckpoint(),
            ...checkpoint,
            channel_values: {
                ...this.getDefaultCheckpoint().channel_values,
                ...checkpoint?.channel_values,
                messages: [...existingMessages, ...newMessages],
            },
            ts: timestamp,
        };

        await collection.updateOne(
            { threadId },
            {
                $set: {
                    state: updatedCheckpoint,
                    updatedAt: timestamp,
                    createdAt: { $ifNull: ["$createdAt", timestamp] },
                    parentConfig: null,
                    metadata: metadata || {},
                },
            },
            { upsert: true }
        );
        return config;
    }

    async putWrites(config, writes) {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(this.collectionName);

        const threadId = config.configurable.thread_id;
        const timestamp = new Date();

        const existingDoc = await collection.findOne({ threadId });
        let existingMessages = existingDoc?.state?.channel_values?.messages || [];

        for (const { checkpoint, metadata } of writes) {
            const newMessages = checkpoint?.channel_values?.messages || [];
            const safeCheckpoint = {
                ...this.getDefaultCheckpoint(),
                ...checkpoint,
                channel_values: {
                    ...this.getDefaultCheckpoint().channel_values,
                    ...checkpoint?.channel_values,
                    messages: [...existingMessages, ...newMessages],
                },
                ts: timestamp,
            };
            await collection.updateOne(
                { threadId },
                {
                    $set: {
                        state: safeCheckpoint,
                        updatedAt: timestamp,
                        createdAt: { $ifNull: ["$createdAt", timestamp] },
                        parentConfig: null,
                        metadata: metadata || {},
                    },
                },
                { upsert: true }
            );
            existingMessages = safeCheckpoint.channel_values.messages;
        }
        return config;
    }

    async *list(config) {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(this.collectionName);

        const cursor = collection.find({});
        for await (const doc of cursor) {
            yield {
                config: {
                    configurable: {
                        thread_id: doc.threadId,
                    },
                },
                checkpoint: doc.state,
                metadata: {
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                },
                parentConfig: doc.parentConfig || null,
            };
        }
    }
}

export const checkpointer = new MongoDBCheckpointSaver();