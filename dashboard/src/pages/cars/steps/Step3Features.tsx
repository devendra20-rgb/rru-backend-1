import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Select, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeatures, getVariantFeatures, createVariantFeature, updateVariantFeature } from '../../../api/features.api';
import type { VariantFeature } from '../../../api/features.api';
import { useToast } from '../../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../../utils/apiError';

interface Step3Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

const Step3Features: React.FC<Step3Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();

  // Fetch all master features
  const { data: masterFeaturesData, isLoading: isLoadingMaster } = useQuery({
    queryKey: ['features', 'all'],
    queryFn: () => getFeatures({ limit: 200, status: 'active' })
  });

  // Fetch mapped features for this variant
  const { data: mappedFeaturesData, isLoading: isLoadingMapped } = useQuery({
    queryKey: ['variant-features', variantId],
    queryFn: () => getVariantFeatures(variantId)
  });

  const [mappings, setMappings] = useState<Record<string, Partial<VariantFeature>>>({});
  
  // Track modified mappings to only save changes
  const [dirtyMappings, setDirtyMappings] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (masterFeaturesData?.data && mappedFeaturesData?.data) {
      const initialMappings: Record<string, Partial<VariantFeature>> = {};
      const featuresList = masterFeaturesData.data?.features || [];
      const mappedData: any = mappedFeaturesData?.data;
      const mappedList = Array.isArray(mappedData) 
        ? mappedData 
        : mappedData?.variantFeatures || mappedData?.features || [];
        
      featuresList.forEach((feature: any) => {
        // Find existing mapping
        const existing = mappedList.find((m: any) => 
          (m.featureId as any)?._id === feature._id || m.featureId === feature._id
        );
        
        initialMappings[feature._id] = existing || {
          variantId,
          featureId: feature._id,
          availability: 'unavailable',
          value: '',
          status: 'active'
        };
      });
      
      setMappings(initialMappings);
    }
  }, [masterFeaturesData, mappedFeaturesData, variantId]);

  const handleMappingChange = (featureId: string, field: keyof VariantFeature, value: any) => {
    setMappings(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [field]: value
      }
    }));
    
    setDirtyMappings(prev => {
      const next = new Set(prev);
      next.add(featureId);
      return next;
    });
  };

  const saveMapping = async (mapping: Partial<VariantFeature>) => {
    if (mapping._id) {
      // It exists, update it
      await updateVariantFeature(mapping._id, {
        availability: mapping.availability,
        value: mapping.value
      });
    } else {
      // It does not exist, create it (if it's not simply 'unavailable')
      if (mapping.availability !== 'unavailable') {
        await createVariantFeature(mapping);
      }
    }
  };

  const handleSaveAndNext = async () => {
    setIsSaving(true);
    try {
      const promises = Array.from(dirtyMappings).map(featureId => saveMapping(mappings[featureId]));
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['variant-features', variantId] });
      onNext();
    } catch (err: any) {
      showToast(getReadableErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingMaster || isLoadingMapped) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  // Group features by category
  const categories: Record<string, any[]> = {};
  const masterFeaturesList = masterFeaturesData?.data?.features || [];
  masterFeaturesList.forEach((f: any) => {
    if (!categories[f.category]) categories[f.category] = [];
    categories[f.category].push(f);
  });

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Select the availability of each feature for this vehicle variant. Standard features are included in the base price, optional features cost extra, and unavailable features cannot be equipped.
      </Typography>

      {Object.entries(categories).map(([category, features]) => (
        <Paper key={category} sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'grey.200', px: 3, py: 1.5 }}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {category}
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="40%">Feature</TableCell>
                  <TableCell width="30%">Availability</TableCell>
                  <TableCell width="30%">Additional Details (Value)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {features.map((feature: any) => {
                  const mapping = mappings[feature._id] || {};
                  return (
                    <TableRow key={feature._id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{feature.name}</Typography>
                        {feature.description && (
                          <Typography variant="caption" color="text.secondary">
                            {feature.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          value={mapping.availability || 'unavailable'}
                          onChange={(e) => handleMappingChange(feature._id, 'availability', e.target.value)}
                        >
                          <MenuItem value="unavailable">Unavailable</MenuItem>
                          <MenuItem value="standard">Standard</MenuItem>
                          <MenuItem value="optional">Optional</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="e.g. 10 Speakers"
                          value={mapping.value || ''}
                          onChange={(e) => handleMappingChange(feature._id, 'value', e.target.value)}
                          disabled={mapping.availability === 'unavailable'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack} variant="outlined" disabled={isSaving}>
          Back
        </Button>
        <Button onClick={handleSaveAndNext} variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </Box>
    </Box>
  );
};

export default Step3Features;
