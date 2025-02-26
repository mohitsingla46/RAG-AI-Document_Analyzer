import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { llm } from "@/app/backend/config/llm.js";
import { retrieve } from "@/app/backend/services/retriever.js";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { checkpointer } from "@/app/backend/lib/checkpointer.js";

async function queryOrRespond(state) {
    const systemPrompt = new SystemMessage(
        "You are an assistant for question-answering tasks about uploaded PDF documents. " +
        "Use the full conversation history and any prior retrieved context to answer directly when possible. " +
        "Only use the 'retrieve' tool if specific document details are missing and required. " +
        "Keep answers concise, max three sentences."
    );

    const prompt = [systemPrompt, ...state.messages];
    const llmWithTools = llm.bindTools([retrieve]);
    const response = await llmWithTools.invoke(prompt);
    return { messages: [response] };
}

const tools = new ToolNode([retrieve]);

async function generate(state) {
    let recentToolMessages = [];
    for (let i = state.messages.length - 1; i >= 0; i--) {
        let message = state.messages[i];
        if (message instanceof ToolMessage) {
            recentToolMessages.push(message);
        } else {
            break;
        }
    }
    const toolMessages = recentToolMessages.reverse();

    const docsContent = toolMessages.map((doc) => doc.content).join("\n");
    const systemMessageContent =
        "You are an assistant for question-answering tasks about uploaded PDF documents. " +
        "Use the following retrieved context to answer the question directly. " +
        "Keep it concise, max three sentences." +
        "\n\n" +
        `${docsContent || "No specific document content retrieved yet."}`;

    const conversationMessages = state.messages.filter(
        (message) =>
            message instanceof HumanMessage ||
            message instanceof SystemMessage ||
            (message instanceof AIMessage && message.tool_calls.length === 0)
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
    .addNode("tools", tools)
    .addNode("generate", generate)
    .addEdge("__start__", "queryOrRespond")
    .addConditionalEdges("queryOrRespond", toolsCondition, {
        __end__: "__end__",
        tools: "tools",
    })
    .addEdge("tools", "generate")
    .addEdge("generate", "__end__");

export const graphWithMemory = graphBuilder.compile({ checkpointer });