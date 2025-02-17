import { Button, Card, CardContent, CardActions, List, ListItem, ListItemText, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DocumentUploadSectionProps {
    pdfFiles: File[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteFile: (fileName: string) => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ pdfFiles, handleFileChange, handleDeleteFile }) => (
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
                    pdfFiles.map(file => (
                        <ListItem key={file.name} secondaryAction={
                            <IconButton edge="end" onClick={() => handleDeleteFile(file.name)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText primary={file.name} />
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">No PDFs uploaded.</Typography>
                )}
            </List>
        </CardContent>
    </Card>
);

export default DocumentUploadSection;
