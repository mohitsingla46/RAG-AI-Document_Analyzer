'use client';

import { Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SignInPage() {
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            console.log('User signed in:', session.user);
        }
    }, [session]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="p-8 rounded-lg w-full max-w-md">
                <Typography variant="h5" gutterBottom className="text-center">
                    Welcome to Our Agent
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph className="text-center">
                    Sign in to start chatting with agent.
                </Typography>

                {/* Sign-in Button */}
                {session ? (
                    <div className="text-center">
                        <p className="mb-2">Signed in as {session.user?.name}</p>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<GoogleIcon />}
                            onClick={() => signOut()}
                            sx={{
                                textTransform: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                            }}
                        >
                            Sign out
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<GoogleIcon />}
                        onClick={() => signIn('google')}
                        sx={{
                            textTransform: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            },
                        }}
                    >
                        Sign in with Google
                    </Button>
                )}
            </div>
        </div >
    );
}
