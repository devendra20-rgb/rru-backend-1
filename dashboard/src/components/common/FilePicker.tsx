import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedia, uploadMedia } from '../../api/media.api';
import type { Media } from '../../api/media.api';
import { resolveMediaUrl, getPlaceholderImage } from '../../utils/media';

interface FilePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  folder?: string;
}

const FilePicker: React.FC<FilePickerProps> = ({ open, onClose, onSelect, folder }) => {
  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['media', folder],
    queryFn: () => getMedia({ folder, limit: 50 }),
    enabled: open && tabIndex === 0
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMedia(file, { folder }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      // Automatically select the newly uploaded file and return it
      onSelect(response.data);
      onClose();
    }
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      uploadMutation.mutate(event.target.files[0]);
    }
  };

  const handleSelectConfirm = () => {
    if (selectedMediaId && data?.data) {
      const selected = data.data.find(m => m._id === selectedMediaId);
      if (selected) {
        onSelect(selected);
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Select Media
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Media Library" />
          <Tab label="Upload New" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 400, bgcolor: '#f8fafc' }}>
        {tabIndex === 0 && (
          <Box>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error">Failed to load media.</Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                {(!data?.data || !Array.isArray(data.data) || data.data.length === 0) ? (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                      No files found.
                    </Typography>
                  </Box>
                ) : (
                  data.data.map((item) => (
                    <Box key={item._id}>
                      <Card 
                        sx={{ 
                          border: selectedMediaId === item._id ? '2px solid' : '2px solid transparent',
                          borderColor: selectedMediaId === item._id ? 'primary.main' : 'transparent',
                          position: 'relative'
                        }}
                      >
                        <CardActionArea onClick={() => setSelectedMediaId(item._id)}>
                          <CardMedia
                            component="img"
                            height="120"
                            image={resolveMediaUrl(item.url)}
                            alt={item.altText || item.originalName || item.filename}
                            onError={(e: any) => {
                              e.target.src = getPlaceholderImage(item.originalName || 'Image', 200, 120);
                            }}
                            sx={{ objectFit: 'cover', bgcolor: 'grey.100' }}
                          />
                          {selectedMediaId === item._id && (
                            <CheckCircleIcon 
                              color="primary" 
                              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', borderRadius: '50%' }} 
                            />
                          )}
                        </CardActionArea>
                      </Card>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>
        )}

        {tabIndex === 1 && (
          <Box 
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, border: '2px dashed #ccc', borderRadius: 2, bgcolor: 'white' }}
          >
            {uploadMutation.isPending ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Uploading...</Typography>
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Select a file to upload
                </Typography>
                <Button variant="contained" component="label">
                  Browse Files
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Button onClick={onClose}>Cancel</Button>
        {tabIndex === 0 && (
          <Button 
            variant="contained" 
            onClick={handleSelectConfirm} 
            disabled={!selectedMediaId}
          >
            Select Image
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FilePicker;
