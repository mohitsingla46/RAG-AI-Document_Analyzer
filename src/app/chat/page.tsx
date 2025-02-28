'use client';
import { useState, useEffect, useRef } from 'react';
import DocumentUploadSection from '@/app/components/DocumentUploadSection';
import ChatSection from '@/app/components/ChatSection';
import Header from '@/app/components/Header';
import { useSession } from 'next-auth/react';

export default function ChatPage() {
    const { data: session, status } = useSession();
    const chatHistoryEndRef = useRef<HTMLDivElement>(null);

    const [pdfFiles, setPdfFiles] = useState<File[]>([]);
    const [chatHistory, setChatHistory] = useState<{ sender: string; message: string; }[]>([]);
    const [isPdfUploaded, setIsPdfUploaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const userId = (session?.user as { id?: string })?.id;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        setLoading(true);
        const newFiles = Array.from(files);
        const uploadedFiles: File[] = [];

        for (const file of newFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
                uploadedFiles.push(file);
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
            }
        }

        if (uploadedFiles.length > 0) {
            setPdfFiles(uploadedFiles);
            setIsPdfUploaded(true);
        }
        setLoading(false);
    };

    const handleDeleteFile = async (fileName: string) => {
        setDeletingFile(fileName);
        try {
            const response = await fetch("/api/files/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to delete file");

            setPdfFiles(prevFiles => {
                const updatedFiles = prevFiles.filter(file => file.name !== fileName);
                if (updatedFiles.length === 0) {
                    setPdfFiles([]);
                    setIsPdfUploaded(false);
                }
                return updatedFiles;
            });
            setChatHistory([]);
        } catch (error) {
            console.error("Error deleting file:", error);
        } finally {
            setDeletingFile(null);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        const newMessage = { sender: "human", message };
        setChatHistory(prevHistory => [...prevHistory, newMessage]);
        setSending(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, threadId: `${userId}-default` }),
            });
            const data = await response.json();
            const agentReply = { sender: "agent", message: data.response };
            setChatHistory(prevHistory => [...prevHistory, agentReply]);
        } catch (error) {
            console.error("Error fetching agent response:", error);
            const agentErrorReply = { sender: "agent", message: "Sorry, I couldn't process your request." };
            setChatHistory(prevHistory => [...prevHistory, agentErrorReply]);
        } finally {
            setSending(false);
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
        };
        fetchpdfFiles();
    }, []);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await fetch(`/api/chat?threadId=${userId}-default`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                if (!response.ok) throw new Error("Failed to fetch chat history");
                const data = await response.json();
                setChatHistory(data.chatHistory);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchChatHistory();
    }, [userId, status]);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#eef2ff] to-[#f3f4f6] px-6 py-4 animate-fade-in">
            <Header />
            <div className="flex-1 flex flex-row space-x-6 mt-6">
                <DocumentUploadSection
                    pdfFiles={pdfFiles}
                    handleFileChange={handleFileChange}
                    handleDeleteFile={handleDeleteFile}
                    loading={loading}
                    deletingFile={deletingFile}
                />
                <ChatSection
                    chatHistory={chatHistory}
                    handleSendMessage={handleSendMessage}
                    isPdfUploaded={isPdfUploaded}
                    chatHistoryEndRef={chatHistoryEndRef}
                    sending={sending}
                />
            </div>
        </div>
    );
}