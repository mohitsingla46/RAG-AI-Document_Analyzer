import "./globals.css";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="description" content="AI Document Analyzer" />
				<meta name="author" content="Mohit Singla" />
				<meta property="og:title" content="AI Document Analyzer" />
				<meta property="og:description" content="Your Open Graph description" />
				<meta property="og:image" content="URL-to-image" />
				<meta property="og:url" content="Your website URL" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@yourtwitterhandle" />
				<meta name="twitter:title" content="AI Document Analyzer" />
				<meta name="twitter:description" content="AI Document Analyzer" />
				<meta name="twitter:image" content="URL-to-image" />
				<title>AI Document Analyzer</title>
			</head>
			<body
				className={`antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
