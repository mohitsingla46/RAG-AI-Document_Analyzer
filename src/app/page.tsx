'use client';
import { Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signIn } from 'next-auth/react';

export default function Home() {
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
			</div>
		</div>
	);
}
