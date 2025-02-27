import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { llm } from "@/app/backend/config/llm.js";
import { retrieve } from "@/app/backend/services/retriever.js";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import clientPromise from "@/app/lib/mongodb";

async function queryOrRespond(state) {
    const llmWithTools = llm.bindTools([retrieve]);
    const response = await llmWithTools.invoke(state.messages);
    return { messages: [response] };
}

const tools = new ToolNode([retrieve]);

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

const client = await clientPromise;
const checkpointer = new MongoDBSaver({ client });
export const graphWithMemory = graphBuilder.compile({ checkpointer });