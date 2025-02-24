import { Button, Card, CardContent, CardActions, List, ListItem, ListItemText, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface PdfFile {
    name?: string; // For uploaded files
    _id?: string; // For stored files from MongoDB
    source?: string; // File name in MongoDB
}

interface DocumentUploadSectionProps {
    pdfFiles: PdfFile[]; // Handles both uploaded & stored PDFs
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteFile: (fileName: string) => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ pdfFiles, handleFileChange, handleDeleteFile }) => {
    return (
        <Card sx={{ width: '30%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Upload PDF File</Typography>
                <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                >
                    Choose File
                    <input
                        type="file"
                        accept="application/pdf"
                        hidden
                        onChange={handleFileChange}
                        multiple
                    />
                </Button>
            </CardContent>
            <CardActions>
                <Typography variant="body2" color="textSecondary" sx={{ flex: 1 }}>
                    Uploaded PDFs
                </Typography>
            </CardActions>
            <CardContent>
                <List>
                    {pdfFiles.length > 0 ? (
                        pdfFiles.map((file, index) => (
                            <ListItem
                                key={file._id || file.name || index} // Ensure unique key
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => handleDeleteFile(file.name || file.source || "")}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText primary={file.name || file.source || "Unnamed File"} />
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary">No PDFs uploaded.</Typography>
                    )}
                </List>
            </CardContent>
        </Card>
    );
}

export default DocumentUploadSection;
