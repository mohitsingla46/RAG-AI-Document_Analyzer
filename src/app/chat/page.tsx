'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button, Typography } from '@mui/material';
import DocumentUploadSection from '../components/DocumentUploadSection';
import ChatSection from '../components/ChatSection';

export default function ChatPage() {
    const router = useRouter();
    const chatHistoryEndRef = useRef<HTMLDivElement>(null); // Reference to scroll to the last message

    const [pdfFiles, setPdfFiles] = useState<File[]>([]); // State to store uploaded PDF files
    const [chatHistory, setChatHistory] = useState([
        { sender: "User", message: "Hi there!", timestamp: "2025-02-17 12:00" },
        { sender: "Bot", message: "Hello! How can I help you?", timestamp: "2025-02-17 12:01" },
    ]); // Sample chat history
    const [isPdfUploaded, setIsPdfUploaded] = useState(false); // State to check if PDF is uploaded

    const handleLogout = () => {
        router.push('/signin');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setPdfFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
            setIsPdfUploaded(true); // Set flag to true when a file is uploaded
        }
    };

    const handleDeleteFile = (fileName: string) => {
        setPdfFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
        if (pdfFiles.length === 1) {
            setIsPdfUploaded(false); // Reset flag if there are no more PDFs uploaded
        }
    };

    const handleSendMessage = (message: string) => {
        const newMessage = {
            sender: "User",
            message,
            timestamp: new Date().toLocaleString(),
        };
        setChatHistory(prevHistory => [...prevHistory, newMessage]);

        // Simulate a bot reply (you can modify this with actual bot logic later)
        const botReply = {
            sender: "Bot",
            message: "Bot: " + message,
            timestamp: new Date().toLocaleString(),
        };
        setChatHistory(prevHistory => [...prevHistory, botReply]);
    };

    // Scroll to the bottom of chat history when a new message is added
    useEffect(() => {
        if (chatHistoryEndRef.current) {
            chatHistoryEndRef.current.scrollTop = chatHistoryEndRef.current.scrollHeight;
        }
    }, [chatHistory]); // Trigger on chat history update

    return (
        <div className="flex flex-col h-screen px-4 bg-gray-100"> {/* Background color applied here */}
            {/* Navbar */}
            <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <Typography variant="h6">AI Document Analyzer</Typography>
                <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
            </nav>

            {/* Main Content with Horizontal Layout */}
            <div className="flex-1 flex flex-row space-x-4 mt-4">
                {/* PDF Upload Section */}
                <DocumentUploadSection
                    pdfFiles={pdfFiles}
                    handleFileChange={handleFileChange}
                    handleDeleteFile={handleDeleteFile}
                />

                {/* Chat Section */}
                <ChatSection
                    chatHistory={chatHistory}
                    handleSendMessage={handleSendMessage}
                    isPdfUploaded={isPdfUploaded}
                    chatHistoryEndRef={chatHistoryEndRef}
                />
            </div>
        </div>
    );
}
