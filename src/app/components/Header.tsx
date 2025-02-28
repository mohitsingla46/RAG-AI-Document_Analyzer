import { Button, Typography, CircularProgress } from '@mui/material'; // Added CircularProgress
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'; // Added useState

const Header: React.FC = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [loggingOut, setLoggingOut] = useState(false); // Added loading state for logout

    const handleLogout = async () => {
        setLoggingOut(true); // Start loading
        try {
            await signOut({ redirect: false });
            router.push('/');
        } catch (error) {
            console.error('Failed to sign out:', error);
        } finally {
            setLoggingOut(false); // Stop loading
        }
    };

    return (
        <nav className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white p-4 flex justify-between items-center shadow-lg">
            <Typography variant="h6" className="font-semibold tracking-wide">
                AI Document Analyzer
            </Typography>
            <div className="flex items-center space-x-4">
                <Typography variant="body1" className="text-white">
                    {session ? `Hi, ${session.user?.name}!` : ''}
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    sx={{
                        textTransform: 'none',
                        padding: '6px 16px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#1f2937',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                            background: '#f3f4f6',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        },
                        '&:disabled': {
                            background: '#e5e7eb',
                            color: '#6b7280',
                            boxShadow: 'none',
                        },
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    {loggingOut ? (
                        <CircularProgress size={20} className="text-[#1f2937]" />
                    ) : (
                        'Logout'
                    )}
                </Button>
            </div>
        </nav>
    );
};

export default Header;