import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getVariantMedia, uploadMedia, deleteMedia, updateMedia } from '../../../api/media.api';

interface Step6Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

const Step6Media: React.FC<Step6Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['variant-media', variantId],
    queryFn: () => getVariantMedia(variantId)
  });

  const mediaList = mediaData?.data || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadMedia(file, {
          entityType: 'variant',
          entityId: variantId,
          isPrimary: mediaList.length === 0 // Make first image primary
        })
      );
      await Promise.all(uploadPromises);
      queryClient.invalidateQueries({ queryKey: ['variant-media', variantId] });
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteMedia(mediaId);
      queryClient.invalidateQueries({ queryKey: ['variant-media', variantId] });
    } catch (err: any) {
      setError(err.message || 'Failed to delete media');
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    try {
      // Find current primary and unset it
      const currentPrimary = mediaList.find((m: any) => m.isPrimary);
      if (currentPrimary && currentPrimary._id !== mediaId) {
        await updateMedia(currentPrimary._id, { isPrimary: false });
      }
      
      // Set new primary
      await updateMedia(mediaId, { isPrimary: true });
      queryClient.invalidateQueries({ queryKey: ['variant-media', variantId] });
    } catch (err: any) {
      setError(err.message || 'Failed to set primary image');
    }
  };

  const handleUpdateSortOrder = async (mediaId: string, order: number) => {
    try {
      await updateMedia(mediaId, { sortOrder: order });
      queryClient.invalidateQueries({ queryKey: ['variant-media', variantId] });
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Upload images for this vehicle variant. Mark one image as the primary cover photo.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 4, textAlign: 'center', border: '2px dashed #ccc', bgcolor: 'grey.50' }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          multiple
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Browse & Upload Images'}
          </Button>
        </label>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          You can select multiple images at once. Max 5MB per image.
        </Typography>
      </Paper>

      {mediaList.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {mediaList.map((media: any) => (
            <Box key={media._id}>
              <Paper sx={{ p: 1, position: 'relative' }}>
                <Box
                  component="img"
                  src={media.url}
                  alt={media.altText || media.originalName}
                  sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <IconButton 
                    size="small" 
                    color={media.isPrimary ? "warning" : "default"}
                    onClick={() => handleSetPrimary(media._id)}
                    title={media.isPrimary ? "Primary Image" : "Set as Primary"}
                  >
                    {media.isPrimary ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                  
                  <TextField 
                    size="small"
                    type="number"
                    label="Sort"
                    sx={{ width: 60 }}
                    defaultValue={media.sortOrder || 0}
                    onBlur={(e) => handleUpdateSortOrder(media._id, Number(e.target.value))}
                  />

                  <IconButton size="small" color="error" onClick={() => handleDelete(media._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack} variant="outlined" disabled={uploading}>
          Back
        </Button>
        <Button onClick={onNext} variant="contained" disabled={uploading}>
          Continue to Review
        </Button>
      </Box>
    </Box>
  );
};

export default Step6Media;
