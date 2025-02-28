import { TextField, IconButton, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';

interface ChatSectionProps {
    chatHistory: { sender: string; message: string; }[];
    handleSendMessage: (message: string) => void;
    isPdfUploaded: boolean;
    chatHistoryEndRef: React.RefObject<HTMLDivElement | null>;
    sending: boolean;
}

const ChatSection: React.FC<ChatSectionProps> = ({ chatHistory, handleSendMessage, isPdfUploaded, chatHistoryEndRef, sending }) => {
    const [message, setMessage] = useState("");

    const sendMessage = () => {
        if (!message.trim()) return;
        handleSendMessage(message);
        setMessage("");
    };

    return (
        <Card className="w-[70%] bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="flex flex-col h-full p-6">
                {isPdfUploaded && (
                    <Typography variant="h5" className="text-[#1f2937] font-semibold mb-4">Chat History</Typography>
                )}

                {!isPdfUploaded ? (
                    <div className="flex flex-col justify-center items-center text-center p-8 bg-gray-50 rounded-lg">
                        <Typography variant="h6" className="text-[#1f2937] font-medium">Upload a PDF to Start Chatting</Typography>
                        <Typography variant="body2" className="text-[#6b7280] mt-2">Add a document to begin your conversation with the agent.</Typography>
                    </div>
                ) : (
                    <div ref={chatHistoryEndRef} className="overflow-y-auto mb-6 flex-grow" style={{ maxHeight: '500px' }}>
                        {chatHistory.map((chat, index) => (
                            <div
                                key={index}
                                className={`p-4 mb-3 rounded-xl max-w-[70%] shadow-sm transition-all duration-200 ${
                                    chat.sender === 'human'
                                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white ml-auto'
                                        : 'bg-gray-100 text-[#1f2937] mr-auto'
                                }`}
                            >
                                <Typography variant="body2" className="leading-relaxed">{chat.message}</Typography>
                            </div>
                        ))}
                        {sending && (
                            <div className="p-4 mb-3 rounded-xl max-w-[70%] bg-gray-100 text-[#1f2937] mr-auto flex items-center space-x-3 animate-pulse">
                                <CircularProgress size={20} className="text-[#4f46e5]" />
                                <Typography variant="body2" className="text-[#6b7280] font-medium">Thinking...</Typography>
                            </div>
                        )}
                    </div>
                )}

                {isPdfUploaded && (
                    <div className="flex items-center space-x-3 mt-auto">
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message..."
                            size="small"
                            sx={{
                                borderRadius: '12px',
                                background: 'linear-gradient(to right, #f9fafb, #eef2ff)',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    '& fieldset': { borderColor: '#d1d5db' },
                                    '&:hover fieldset': { borderColor: '#60a5fa' },
                                    '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                                },
                            }}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                            autoComplete="off"
                            className="shadow-sm"
                        />
                        <IconButton
                            sx={{
                                padding: '10px',
                                background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                                color: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
                                '&:hover': { background: 'linear-gradient(to right, #4338ca, #6d28d9)' },
                            }}
                            onClick={sendMessage}
                        >
                            <SendIcon />
                        </IconButton>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ChatSection;