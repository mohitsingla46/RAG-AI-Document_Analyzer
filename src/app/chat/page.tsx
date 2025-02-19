'use client';
import { useState, useEffect, useRef } from 'react';
import DocumentUploadSection from '@/app/components/DocumentUploadSection';
import ChatSection from '@/app/components/ChatSection';
import Header from '@/app/components/Header';

export default function ChatPage() {
    const chatHistoryEndRef = useRef<HTMLDivElement>(null);

    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [chatHistory, setChatHistory] = useState([
        { sender: "User", message: "Hi there!", timestamp: "2025-02-17 12:00" },
        { sender: "Bot", message: "Hello! How can I help you?", timestamp: "2025-02-17 12:01" },
    ]);
    const [isPdfUploaded, setIsPdfUploaded] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        setPdfFiles(prevFiles => [...prevFiles, ...newFiles]);
        setIsPdfUploaded(true);

        for (const file of newFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');

                console.log(`Uploaded ${file.name} successfully!`);
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
            }
        }
    };

    const handleDeleteFile = (fileName: string) => {
        setPdfFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
        if (pdfFiles.length === 1) {
            setIsPdfUploaded(false);
        }
    };

    const handleSendMessage = (message: string) => {
        const newMessage = {
            sender: "User",
            message,
            timestamp: new Date().toLocaleString(),
        };
        setChatHistory(prevHistory => [...prevHistory, newMessage]);

        const botReply = {
            sender: "Bot",
            message: "Bot: " + message,
            timestamp: new Date().toLocaleString(),
        };
        setChatHistory(prevHistory => [...prevHistory, botReply]);
    };

    useEffect(() => {
        if (chatHistoryEndRef.current) {
            chatHistoryEndRef.current.scrollTop = chatHistoryEndRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className="flex flex-col h-screen px-4 bg-gray-100">
            <Header />

            <div className="flex-1 flex flex-row space-x-4 mt-4">
                <DocumentUploadSection
                    pdfFiles={pdfFiles}
                    handleFileChange={handleFileChange}
                    handleDeleteFile={handleDeleteFile}
                />

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
