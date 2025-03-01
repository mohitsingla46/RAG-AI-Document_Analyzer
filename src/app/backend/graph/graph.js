import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { llm } from "@/app/backend/config/llm.js";
import { retrieve } from "@/app/backend/services/retriever.js";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import clientPromise from "@/app/lib/mongodb";

const toolsCondition = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];

    // Ensure the tool gets executed when a tool call exists
    if (lastMessage.tool_calls?.length > 0) {
        return "tools";
    }
    return "__end__";
};

async function queryOrRespond(state) {
    const systemMessageContent = new SystemMessage(
        "You are an assistant for question-answering tasks. " +
        "When the conversation is new, greet the user and ask how you can help. " +
        "If the answer is in the conversation history, answer directly. " +
        "Otherwise, use the 'retrieve' tool properly in JSON format."
    );

    const conversationMessages = state.messages.filter(
        (msg) =>
            msg instanceof HumanMessage ||
            msg instanceof SystemMessage ||
            (msg instanceof AIMessage && !msg.tool_calls)
    );

    const messages = [systemMessageContent, ...conversationMessages];

    let llmWithTools = llm.bindTools([retrieve], {
        enforceToolUsage: true,
        responseFormat: "json",
    });

    let response = await llmWithTools.invoke(messages);

    // 🛠 Fix: Ensure JSON Tool Calls Instead of Raw String
    if (
        typeof response.content === 'string' && 
        response.content.includes("<function=") // ❌ Invalid Format Check
    ) {
        console.warn("⚠️ Raw function call detected. Retrying with enforced JSON...");

        llmWithTools = llm.bindTools([retrieve], {
            enforceToolUsage: true,
            responseFormat: "json",
        });

        response = await llmWithTools.invoke(messages);

        // Still not JSON? Throw an error
        if (typeof response.content === 'string' && response.content.includes("<function=")) {
            console.error("❌ LLM is still returning raw function call! Fix needed.");
            throw new Error("LLM did not return JSON tool calls. Check prompt enforcement.");
        }
    }

    if (!(response instanceof AIMessage)) {
        console.error("❌ Unexpected LLM response format:", response);
        throw new Error("LLM did not return a valid AIMessage object.");
    }

    return { messages: [response] };
}

async function generate(state) {
    let recentToolMessages = [];
    for (let i = state["messages"].length - 1; i >= 0; i--) {
        let message = state["messages"][i];
        if (message instanceof ToolMessage) {
            recentToolMessages.push(message);
        } else {
            break;
        }
    }
    let toolMessages = recentToolMessages.reverse();

    const docsContent = toolMessages.map((doc) => doc.content).join("\n");
    const systemMessageContent =
        "You are an assistant for question-answering tasks. " +
        "Use the following pieces of retrieved context to answer " +
        "the question. If you don't know the answer, say that you " +
        "don't know. Use three sentences maximum and keep the " +
        "answer concise." +
        "\n\n" +
        `${docsContent}`;

    const conversationMessages = state.messages.filter(
        (message) =>
            message instanceof HumanMessage ||
            message instanceof SystemMessage ||
            (message instanceof AIMessage && message.tool_calls?.length === 0)
    );
    const prompt = [
        new SystemMessage(systemMessageContent),
        ...conversationMessages,
    ];

    const response = await llm.invoke(prompt);
    return { messages: [response] };
}

const graphBuilder = new StateGraph(MessagesAnnotation)
    .addNode("queryOrRespond", queryOrRespond)
    .addNode("tools", new ToolNode([retrieve]))
    .addNode("generate", generate)
    .addEdge("__start__", "queryOrRespond")
    .addConditionalEdges("queryOrRespond", toolsCondition, {
        __end__: "__end__",
        tools: "tools",
    })
    .addEdge("tools", "generate")
    .addEdge("generate", "__end__");

const client = await clientPromise;
const checkpointer = new MongoDBSaver({ client });
export const graphWithMemory = graphBuilder.compile({ checkpointer });