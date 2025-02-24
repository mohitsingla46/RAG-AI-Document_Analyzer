'use client';
import { useState, useEffect, useRef } from 'react';
import DocumentUploadSection from '@/app/components/DocumentUploadSection';
import ChatSection from '@/app/components/ChatSection';
import Header from '@/app/components/Header';

export default function ChatPage() {
    const chatHistoryEndRef = useRef<HTMLDivElement>(null);

    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [chatHistory, setChatHistory] = useState<{ sender: string; message: string; }[]>([]);
    const [isPdfUploaded, setIsPdfUploaded] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        setPdfFiles(newFiles);
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
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
            }
        }
    };

    const handleDeleteFile = async (fileName: string) => {
        try {
            const response = await fetch("/api/files/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete file");
            }

            setPdfFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
            if (pdfFiles.length === 1) {
                setIsPdfUploaded(false);
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        const newMessage = {
            sender: "User",
            message
        };
        setChatHistory(prevHistory => [...prevHistory, newMessage]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newMessage),
            });

            const data = await response.json();

            const botReply = {
                sender: "Bot",
                message: data.response
            };

            setChatHistory(prevHistory => [...prevHistory, botReply]);
        } catch (error) {
            console.error("Error fetching bot response:", error);
            const botErrorReply = {
                sender: "Bot",
                message: "Sorry, I couldn't process your request."
            };
            setChatHistory(prevHistory => [...prevHistory, botErrorReply]);
        }
    };

    useEffect(() => {
        if (chatHistoryEndRef.current) {
            chatHistoryEndRef.current.scrollTop = chatHistoryEndRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        const fetchpdfFiles = async () => {
            try {
                const response = await fetch('/api/files');
                if (!response.ok) throw new Error('Failed to fetch PDF files');

                const data = await response.json();

                setPdfFiles(data.files);
                setIsPdfUploaded(data.files.length > 0);
            } catch (error) {
                console.error('Error fetching PDF files:', error);
            }
        }

        fetchpdfFiles();
    }, [])

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
