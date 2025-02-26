import { NextResponse } from "next/server";
import { graphWithMemory } from "@/app/backend/graph/graph";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/backend/lib/auth";
import { getChatHistory, saveChatMessage } from "@/app/backend/services/vectorStore";

export const POST = async (req) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { message, threadId = `${userId}-default` } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        await saveChatMessage(userId, threadId, "human", message);

        const inputs = { messages: message };
        const threadConfig = { configurable: { thread_id: threadId }, streamMode: "values" };

        let responseMessage = "";
        for await (const step of await graphWithMemory.stream(inputs, threadConfig)) {
            const lastMessage = step.messages[step.messages.length - 1];
            responseMessage = lastMessage.content;
        }

        await saveChatMessage(userId, threadId, "agent", responseMessage);

        return NextResponse.json({ response: responseMessage });
    } catch (error) {
        console.error("Error processing messages:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
};

export const GET = async (req) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        const threadId = searchParams.get("threadId") || `${userId}-default`;

        const chatHistory = await getChatHistory(userId, threadId);
        return NextResponse.json({ chatHistory });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
    }
};