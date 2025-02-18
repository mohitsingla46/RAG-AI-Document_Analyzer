import { Button, Typography } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'

const Header: React.FC = () => {
    const router = useRouter();
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <Typography variant="h6">AI Document Analyzer</Typography>
            <div className="flex items-center space-x-4">
                <Typography variant="body1">
                    {session ? `Hi, ${session.user?.name}!` : ''}
                </Typography>
                <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
            </div>
        </nav>
    );
}

export default Header