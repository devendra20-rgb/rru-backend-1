import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Select, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeatures, getVariantFeatures, createVariantFeature, updateVariantFeature } from '../../../api/features.api';
import type { VariantFeature } from '../../../api/features.api';
import AddIcon from '@mui/icons-material/Add';
import QuickAddModal from '../../../components/common/QuickAddModal';
import FeatureForm from '../../features/FeatureForm';

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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

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

  const handleBulkAvailability = (featuresToUpdate: any[], availability: 'standard' | 'unavailable') => {
    setMappings(prev => {
      const next = { ...prev };
      featuresToUpdate.forEach(f => {
        next[f._id] = { ...next[f._id], availability };
      });
      return next;
    });
    
    setDirtyMappings(prev => {
      const next = new Set(prev);
      featuresToUpdate.forEach(f => next.add(f._id));
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
    setError(null);
    try {
      const promises = Array.from(dirtyMappings).map(featureId => saveMapping(mappings[featureId]));
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['variant-features', variantId] });
      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to save feature mappings');
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
  
  const filteredFeatures = masterFeaturesList.filter((f: any) => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredFeatures.forEach((f: any) => {
    if (!categories[f.category]) categories[f.category] = [];
    categories[f.category].push(f);
  });

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Select the availability of each feature for this vehicle variant. Standard features are included in the base price, optional features cost extra, and unavailable features cannot be equipped.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200, maxWidth: { xs: '100%', sm: '33.3333%' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={() => setFeatureModalOpen(true)}
        >
          Add New Feature
        </Button>
      </Box>

      {Object.entries(categories).map(([category, features]) => (
        <Paper key={category} sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'grey.200', px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {category}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" color="primary" onClick={() => handleBulkAvailability(features, 'standard')}>
                Available All
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={() => handleBulkAvailability(features, 'unavailable')}>
                Unavailable All
              </Button>
            </Box>
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
                          <MenuItem value="standard">Available</MenuItem>
                          <MenuItem value="optional">Not Applicable</MenuItem>
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

      <QuickAddModal open={featureModalOpen} onClose={() => setFeatureModalOpen(false)} title="Quick Add Feature">
        <FeatureForm 
          onSuccess={() => {
            setFeatureModalOpen(false);
            // The newly created feature will automatically appear in the list 
            // once the react-query invalidation in FeatureForm finishes.
            // We can explicitly add it to mappings if needed, but it's optional.
          }}
          onCancel={() => setFeatureModalOpen(false)}
        />
      </QuickAddModal>
    </Box>
  );
};

export default Step3Features;
