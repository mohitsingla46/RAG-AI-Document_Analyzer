import { TextField, IconButton, Typography, Card, CardContent } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';

interface ChatSectionProps {
    chatHistory: { sender: string; message: string; }[];
    handleSendMessage: (message: string) => void;
    isPdfUploaded: boolean;
    chatHistoryEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatSection: React.FC<ChatSectionProps> = ({ chatHistory, handleSendMessage, isPdfUploaded, chatHistoryEndRef }) => {
    const [message, setMessage] = useState("");

    const sendMessage = () => {
        if (!message.trim()) return;
        handleSendMessage(message);
        setMessage("");
    };

    return (
        <Card sx={{ width: '70%' }}>
            <CardContent className="flex flex-col h-full">
                {/* Render Chat History title only if PDF is uploaded */}
                {isPdfUploaded && (
                    <Typography variant="h6" gutterBottom>Chat History</Typography>
                )}

                {/* Display message to upload a PDF if not uploaded yet */}
                {!isPdfUploaded ? (
                    <div className="flex flex-col justify-center items-center text-center p-8">
                        <Typography variant="h6" color="textPrimary">Please upload a PDF document to get started with the chat.</Typography>
                        <Typography variant="body2" color="textSecondary">You need to upload a document first to be able to chat with the bot.</Typography>
                    </div>
                ) : (
                    <div ref={chatHistoryEndRef} className="overflow-y-auto mb-4 flex-grow" style={{ maxHeight: '500px' }}>
                        {/* Displaying Chat History */}
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`p-3 mb-2 rounded-lg max-w-[70%] ${chat.sender === 'User' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-black mr-auto'}`}>
                                <Typography variant="body2">{chat.message}</Typography>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input box and send button at the bottom */}
                {isPdfUploaded && (
                    <div className="flex items-center space-x-2 mt-auto">
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message here..."
                            size="small"
                            sx={{
                                borderRadius: '10px',
                                backgroundColor: '#f4f6f8',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                }
                            }}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                        />
                        <IconButton
                            color="primary"
                            sx={{
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                borderRadius: '10px', // Rounded corners for better alignment
                                border: '1px solid #1976d2',
                                '&:hover': { backgroundColor: '#1565c0' },
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
}

export default ChatSection;
