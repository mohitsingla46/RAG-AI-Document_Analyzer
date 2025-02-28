import { Button, Card, CardContent, CardActions, List, ListItem, ListItemText, IconButton, Typography, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface PdfFile {
    name?: string;
    _id?: string;
    source?: string;
}

interface DocumentUploadSectionProps {
    pdfFiles: PdfFile[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteFile: (fileName: string) => void;
    loading: boolean;
    deletingFile: string | null;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ pdfFiles, handleFileChange, handleDeleteFile, loading, deletingFile }) => {
    return (
        <Card className="w-[30%] bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
                <Typography variant="h5" className="text-[#1f2937] font-semibold mb-4">Upload PDFs</Typography>
                <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    disabled={loading || deletingFile !== null}
                    className={`bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white py-2 rounded-lg shadow-md hover:from-[#4338ca] hover:to-[#6d28d9] transition-all duration-200 ${loading || deletingFile !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <CircularProgress size={20} className="text-white" />
                            <span>Processing...</span>
                        </div>
                    ) : (
                        "Choose Files"
                    )}
                    <input type="file" accept="application/pdf" hidden onChange={handleFileChange} multiple />
                </Button>
            </CardContent>
            <CardActions className="px-6">
                <Typography variant="body2" className="text-[#6b7280] font-medium flex-1">Uploaded Documents</Typography>
            </CardActions>
            <CardContent className="p-6">
                <List>
                    {pdfFiles.length > 0 ? (
                        pdfFiles.map((file, index) => {
                            const fileName = file.name || file.source || "";
                            const isDeleting = deletingFile === fileName;
                            return (
                                <ListItem
                                    key={file._id || file.name || index}
                                    className="bg-gray-50 rounded-lg mb-2 hover:bg-gray-100 transition-colors duration-150"
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDeleteFile(fileName)}
                                            disabled={loading || deletingFile !== null}
                                            className="hover:text-[#4338ca] transition-colors duration-200"
                                        >
                                            {isDeleting ? (
                                                <CircularProgress size={20} className="text-[#4338ca]" />
                                            ) : (
                                                <DeleteIcon className="text-[#4338ca]" />
                                            )}
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={fileName || "Unnamed File"} className="text-[#1f2937] truncate" />
                                </ListItem>
                            );
                        })
                    ) : (
                        <Typography variant="body2" className="text-[#6b7280] italic">No PDFs uploaded yet.</Typography>
                    )}
                </List>
            </CardContent>
        </Card>
    );
};

export default DocumentUploadSection;