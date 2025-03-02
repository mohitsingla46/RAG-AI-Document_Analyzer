# AI PDF Analyzer

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://your-build-status-url.com)

**Chat with your PDFs!** This project provides a user-friendly application that lets you ask questions about your PDF documents and get AI-powered answers.

## Overview

The AI PDF Analyzer is a full-stack application that utilizes the power of Large Language Models (LLMs), vector databases, and document retrieval to allow you to interact with your PDF content in a conversational way.  Whether you need to extract specific information, summarize key points, or understand complex data, this tool can help.

## Key Features

*   **Conversational Interaction:** Ask questions about your PDF and receive natural language responses.
*   **AI-Powered Insights:** Leverages LLMs for intelligent understanding and analysis of your document content.
*   **Document Retrieval:** Finds relevant information within your PDF to provide accurate answers.
*   **Stateful Conversations:** Remembers previous questions and responses for context-aware interactions.
*   **User Friendly**: A front end is present, for a better user experience.
*   **Persistent Data:** Stores conversation state and embeddings for a seamless experience across sessions.

## Technologies Used

*   **Large Language Models (LLMs):**  For natural language understanding and response generation.
*   **LangChain & LangGraph:** For orchestrating LLMs, retrieval, and tools in a modular way.
* **Groq**: For faster inference of LLM.
*   **Nomic Embeddings:** For creating vector representations of document content.
*   **MongoDB as a Vector Database:** For storing and efficiently querying vector embeddings.
* **Front end technologies**: The frontend use a framework such as react, or vue, and is well structured.

## Getting Started

1.  **Prerequisites:**
    *   Node.js (version 20.x or higher)
    *   MongoDB (running instance)
    *   API key for your chosen LLM provider (e.g., OpenAI, Groq)
    *   API key for Embedding Model (e.g., Nomic)
    * A front-end framework, such as react.

2.  **Installation:**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    npm install # For dependencies.
    ```

3.  **Configuration:**
    *   Create a `.env` file in the project root directory.
    *   Set environment variables:
        ```
        GOOGLE_CLIENT_ID=
        GOOGLE_CLIENT_SECRET=
        NEXTAUTH_URL=http://localhost:3000 # Replace with your deployment url, if not local
        NEXTAUTH_SECRET=
        MONGODB_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/<your-database>?retryWrites=true&w=majority&appName=<your-cluster-name> #Update username, password, cluster, and database name.
        GROQ_API_KEY=
        NOMIC_API_KEY=
        ```

4.  **Running the Application:**
    ```bash
    # In the root directory
    npm run dev
    ```

5. **Accessing the application**:
    - Go to your web navigator, and go to `localhost:3000`, or the port that you specified in the frontend application.

## Contact

For any questions or inquiries, please contact [mhtkumar46@gmail.com](mhtkumar46@gmail.com).
