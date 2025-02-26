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

        const inputs = { messages: [{ role: "human", content: message }] };
        const threadConfig = { configurable: { thread_id: threadId }, streamMode: "values" };

        let responseMessage = "";
        const stream = await graphWithMemory.stream(inputs, threadConfig);
        for await (const step of stream) {
            const messages = step.messages || [];
            messages.forEach((msg, msgIndex) => {
                const content = msg.kwargs?.content || msg.content || "";
                if (content && (!msg.kwargs?.tool_calls || msg.kwargs.tool_calls.length === 0)) {
                    responseMessage = content;
                }
            });
        }

        if (!responseMessage) {
            return NextResponse.json({ error: "No response generated" }, { status: 500 });
        }

        await saveChatMessage(userId, threadId, "agent", responseMessage);

        return NextResponse.json({ response: responseMessage });
    } catch (error) {
        console.error("Error processing messages:", error, error.stack);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
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