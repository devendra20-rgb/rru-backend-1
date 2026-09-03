import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getColors, getVariantColors, createVariantColor, updateVariantColor } from '../../../api/colors.api';
import type { VariantColor } from '../../../api/colors.api';
import AddIcon from '@mui/icons-material/Add';
import QuickAddModal from '../../../components/common/QuickAddModal';
import ColorForm from '../../colors/ColorForm';

interface Step4Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

const Step4Colors: React.FC<Step4Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();

  // Fetch all master colors
  const { data: masterColorsData, isLoading: isLoadingMaster } = useQuery({
    queryKey: ['colors', 'all'],
    queryFn: () => getColors({ limit: 100, status: 'active' })
  });

  // Fetch mapped colors for this variant
  const { data: mappedColorsData, isLoading: isLoadingMapped } = useQuery({
    queryKey: ['variant-colors', variantId],
    queryFn: () => getVariantColors(variantId)
  });

  const [mappings, setMappings] = useState<Record<string, Partial<VariantColor>>>({});
  
  // Track modified mappings to only save changes
  const [dirtyMappings, setDirtyMappings] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorModalOpen, setColorModalOpen] = useState(false);

  useEffect(() => {
    if (masterColorsData?.data && mappedColorsData?.data) {
      const initialMappings: Record<string, Partial<VariantColor>> = {};
      const colorsList = masterColorsData.data?.colors || [];
      const mappedData: any = mappedColorsData?.data;
      const mappedList = Array.isArray(mappedData) 
        ? mappedData 
        : mappedData?.variantColors || mappedData?.colors || [];
        
      colorsList.forEach((color: any) => {
        // Find existing mapping
        const existing = mappedList.find((m: any) => 
          (m.colorId as any)?._id === color._id || m.colorId === color._id
        );
        
        initialMappings[color._id] = existing || {
          variantId,
          colorId: color._id,
          availability: 'unavailable',
          status: 'active'
        };
      });
      
      setMappings(initialMappings);
    }
  }, [masterColorsData, mappedColorsData, variantId]);

  const handleMappingChange = (colorId: string, field: keyof VariantColor, value: any) => {
    setMappings(prev => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        [field]: value
      }
    }));
    
    setDirtyMappings(prev => {
      const next = new Set(prev);
      next.add(colorId);
      return next;
    });
  };

  const saveMapping = async (mapping: Partial<VariantColor>) => {
    if (mapping._id) {
      // It exists, update it
      await updateVariantColor(mapping._id, {
        availability: mapping.availability
      });
    } else {
      // It does not exist, create it (if it's not simply 'unavailable')
      if (mapping.availability !== 'unavailable') {
        await createVariantColor(mapping);
      }
    }
  };

  const handleSaveAndNext = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const promises = Array.from(dirtyMappings).map(colorId => saveMapping(mappings[colorId]));
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['variant-colors', variantId] });
      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to save color mappings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingMaster || isLoadingMapped) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const colors = masterColorsData?.data?.colors || [];
  const filteredColors = colors.filter((color: any) => 
    color.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Select the availability of each exterior and interior color for this vehicle variant. 
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

       <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200, maxWidth: { xs: '100%', sm: '33.3333%' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={() => setColorModalOpen(true)}
        >
          Add New Color
        </Button>
      </Box>

      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="10%">Preview</TableCell>
                <TableCell width="30%">Color Name</TableCell>
                <TableCell width="20%">Color Code</TableCell>
                <TableCell width="40%">Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredColors.map((color: any) => {
                const mapping = mappings[color._id] || {};
                return (
                  <TableRow key={color._id}>
                    <TableCell>
                      {color.hexCode ? (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: color.hexCode,
                            border: '1px solid #ccc'
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{color.name}</Typography>
                      {color.finishType && (
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {color.finishType}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{color.colorCode}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        fullWidth
                        value={mapping.availability || 'unavailable'}
                        onChange={(e) => handleMappingChange(color._id, 'availability', e.target.value)}
                      >
                        <MenuItem value="unavailable">Unavailable</MenuItem>
                        <MenuItem value="standard">Available</MenuItem>
                        <MenuItem value="optional">Optional</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack} variant="outlined" disabled={isSaving}>
          Back
        </Button>
        <Button onClick={handleSaveAndNext} variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </Box>

      <QuickAddModal open={colorModalOpen} onClose={() => setColorModalOpen(false)} title="Quick Add Color">
        <ColorForm 
          onSuccess={() => {
            setColorModalOpen(false);
            // Color list refreshes via react-query and appears dynamically
          }}
          onCancel={() => setColorModalOpen(false)}
        />
      </QuickAddModal>
    </Box>
  );
};

export default Step4Colors;
