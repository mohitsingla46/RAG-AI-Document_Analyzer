import { NextResponse } from "next/server";
import { graphWithMemory } from "@/app/backend/graph/graph";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const POST = async (req) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        const inputs = { messages: message };
        const threadConfig = { configurable: { thread_id: "abc123" }, streamMode: "values" };

        let responseMessage = "";

        for await (const step of await graphWithMemory.stream(inputs, threadConfig)) {
            const lastMessage = step.messages[step.messages.length - 1];
            responseMessage = lastMessage.content;
        }

        return NextResponse.json({ response: responseMessage });
    } catch (error) {
        console.error("Error processing messages:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
};