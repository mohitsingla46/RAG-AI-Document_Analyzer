'use client';
import { useState } from 'react';
import { Button, Typography, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signIn } from 'next-auth/react';

export default function Home() {
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await signIn('google');
        } catch (error) {
            console.error('Failed to sign in', error);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#eef2ff] to-[#f3f4f6] p-6 animate-fade-in">
            <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
                <Typography
                    variant="h5"
                    className="text-center text-[#1f2937] font-semibold mb-8 tracking-wide" // Increased from mb-6 to mb-8
                >
                    Welcome to AI Document Analyzer
                </Typography>
                <Typography
                    variant="body1"
                    className="text-center text-[#6b7280] mb-12 leading-loose p-4" // Increased from mb-8 to mb-12
                >
                    Sign in to unlock a world of intelligent conversations with your documents.
                </Typography>

                <Button
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    onClick={handleSignIn}
                    startIcon={!loading && <GoogleIcon className="text-white" />}
                    sx={{
                        textTransform: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(to right, #4338ca, #6d28d9)',
                            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.5)',
                        },
                        '&:disabled': {
                            background: 'linear-gradient(to right, #a1a1aa, #a1a1aa)',
                            boxShadow: 'none',
                            opacity: 0.7,
                        },
                        transition: 'all 0.3s ease-in-out',
                    }}
                    className="flex items-center justify-center"
                >
                    {loading ? (
                        <CircularProgress size={24} className="text-white" />
                    ) : (
                        <span className="text-base font-medium">Sign in with Google</span>
                    )}
                </Button>
            </div>
        </div>
    );
}