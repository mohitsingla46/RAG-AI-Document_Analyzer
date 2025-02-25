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
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
			<div className="p-8 rounded-lg w-full max-w-md">
				<Typography variant="h5" gutterBottom className="text-center">
					Welcome to Our Agent
				</Typography>
				<Typography variant="body2" color="textSecondary" paragraph className="text-center">
					Sign in to start chatting with agent.
				</Typography>

				{/* Sign-in Button */}
				<Button
					variant="contained"
					color="primary"
					fullWidth
					startIcon={!loading && <GoogleIcon />}
					disabled={loading}
					onClick={handleSignIn}
					sx={{
						textTransform: 'none',
						padding: '12px',
						borderRadius: '8px',
						'&:hover': {
							backgroundColor: loading ? '#1976d2' : '#1565c0',
						},
					}}
				>
					{loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in with Google'}
				</Button>
			</div>
		</div>
	);
}
