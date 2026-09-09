import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeatures, getVariantFeatures, createVariantFeature, updateVariantFeature } from '../../../api/features.api';
import type { VariantFeature } from '../../../api/features.api';
import QuickAddModal from '../../../components/common/QuickAddModal';
import FeatureForm from '../../features/FeatureForm';

interface Step3Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_ORDER = [
  'safety',
  'exterior',
  'interior',
  'comfort',
  'infotainment',
  'convenience',
  'performance',
  'other',
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  safety: 'Safety & Security',
  exterior: 'Exterior',
  interior: 'Interior',
  comfort: 'Comfort',
  infotainment: 'Infotainment & Connectivity',
  convenience: 'Convenience',
  performance: 'Performance',
  other: 'Other',
};

const formatCategoryLabel = (category: string) =>
  CATEGORY_LABELS[category] || category.replace(/_/g, ' ');

const Step3Features: React.FC<Step3Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();

  const { data: masterFeaturesData, isLoading: isLoadingMaster } = useQuery({
    queryKey: ['features', 'all'],
    queryFn: () => getFeatures({ limit: 200, status: 'active' }),
  });

  const { data: mappedFeaturesData, isLoading: isLoadingMapped } = useQuery({
    queryKey: ['variant-features', variantId],
    queryFn: () => getVariantFeatures(variantId),
  });

  const [mappings, setMappings] = useState<Record<string, Partial<VariantFeature>>>({});
  const [dirtyMappings, setDirtyMappings] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (masterFeaturesData?.data && mappedFeaturesData?.data) {
      const initialMappings: Record<string, Partial<VariantFeature>> = {};
      const featuresList = masterFeaturesData.data?.features || [];
      const mappedData: any = mappedFeaturesData.data;
      const mappedList = Array.isArray(mappedData)
        ? mappedData
        : mappedData?.variantFeatures || mappedData?.features || [];

      featuresList.forEach((feature: any) => {
        const existing = mappedList.find(
          (m: any) => (m.featureId as any)?._id === feature._id || m.featureId === feature._id,
        );

        initialMappings[feature._id] = existing || {
          variantId,
          featureId: feature._id,
          availability: 'unavailable',
          value: '',
          status: 'active',
        };
      });

      setMappings(initialMappings);
    }
  }, [masterFeaturesData, mappedFeaturesData, variantId]);

  const masterFeaturesList = masterFeaturesData?.data?.features || [];

  const groupedFeatures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = masterFeaturesList.filter((f: any) => {
      if (!q) return true;
      const haystack = [f.name, f.description, f.category, formatCategoryLabel(f.category)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    const groups: Record<string, any[]> = {};
    filtered.forEach((feature: any) => {
      const category = feature.category || 'other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(feature);
    });

    Object.values(groups).forEach((list) =>
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    );

    const orderedKeys = [
      ...CATEGORY_ORDER.filter((cat) => groups[cat]?.length),
      ...Object.keys(groups)
        .filter((cat) => !CATEGORY_ORDER.includes(cat as (typeof CATEGORY_ORDER)[number]))
        .sort(),
    ];

    return orderedKeys.map((category) => ({
      category,
      label: formatCategoryLabel(category),
      features: groups[category] || [],
    }));
  }, [masterFeaturesList, searchQuery]);

  useEffect(() => {
    if (groupedFeatures.length === 0) {
      setExpandedCategories([]);
      return;
    }
    setExpandedCategories((prev) => {
      const valid = prev.filter((cat) => groupedFeatures.some((g) => g.category === cat));
      if (valid.length > 0) return valid;
      return [groupedFeatures[0].category];
    });
  }, [groupedFeatures]);

  const handleMappingChange = (featureId: string, field: keyof VariantFeature, value: any) => {
    setMappings((prev) => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [field]: value,
      },
    }));

    setDirtyMappings((prev) => {
      const next = new Set(prev);
      next.add(featureId);
      return next;
    });
  };

  const handleBulkAvailability = (featuresToUpdate: any[], availability: 'standard' | 'unavailable') => {
    setMappings((prev) => {
      const next = { ...prev };
      featuresToUpdate.forEach((f) => {
        next[f._id] = { ...next[f._id], availability };
      });
      return next;
    });

    setDirtyMappings((prev) => {
      const next = new Set(prev);
      featuresToUpdate.forEach((f) => next.add(f._id));
      return next;
    });
  };

  const getCategoryStats = (features: any[]) => {
    const configured = features.filter(
      (f) => mappings[f._id]?.availability && mappings[f._id]?.availability !== 'unavailable',
    ).length;
    return { configured, total: features.length };
  };

  const handleAccordionChange =
    (category: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedCategories((prev) =>
        isExpanded ? [...prev, category] : prev.filter((c) => c !== category),
      );
    };

  const expandAll = () => setExpandedCategories(groupedFeatures.map((g) => g.category));
  const collapseAll = () => setExpandedCategories([]);

  const saveMapping = async (mapping: Partial<VariantFeature>) => {
    if (mapping._id) {
      await updateVariantFeature(mapping._id, {
        availability: mapping.availability,
        value: mapping.value,
      });
    } else if (mapping.availability !== 'unavailable') {
      await createVariantFeature(mapping);
    }
  };

  const handleSaveAndNext = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const promises = Array.from(dirtyMappings).map((featureId) => saveMapping(mappings[featureId]));
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Work through features category by category. Expand a section, set availability and details, then move to the next.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

<Stack
  direction={{ xs: "column", sm: "row" }}
  spacing={"..."}
  sx={{
    mb: "...",
    alignItems: { sm: "..." },
  }}
>
        <TextField
          fullWidth
          size="small"
          placeholder="Search features…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: { sm: 360 } }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="text" onClick={expandAll} disabled={groupedFeatures.length === 0}>
            Expand all
          </Button>
          <Button size="small" variant="text" onClick={collapseAll} disabled={groupedFeatures.length === 0}>
            Collapse all
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setFeatureModalOpen(true)}>
            Add New Feature
          </Button>
        </Box>
      </Stack>

      {groupedFeatures.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? 'No features match your search.' : 'No features available.'}
          </Typography>
        </Paper>
      ) : (
        groupedFeatures.map(({ category, label, features }) => {
          const stats = getCategoryStats(features);
          const isExpanded = expandedCategories.includes(category);

          return (
            <Accordion
              key={category}
              expanded={isExpanded}
              onChange={handleAccordionChange(category)}
              disableGutters
              sx={{
                mb: 1.5,
                '&:before': { display: 'none' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '4px !important',
                overflow: 'hidden',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'grey.100',
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    my: 1,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${stats.configured}/${stats.total} set`}
                    color={stats.configured > 0 ? 'primary' : 'default'}
                    variant={stats.configured > 0 ? 'filled' : 'outlined'}
                  />
                </Box>
                <Box
                  sx={{ display: 'flex', gap: 1, flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleBulkAvailability(features, 'standard')}
                  >
                    Available all
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleBulkAvailability(features, 'unavailable')}
                  >
                    Unavailable all
                  </Button>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
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
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {feature.name}
                              </Typography>
                              {feature.description && (
                                <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "...",
                                }}
                              >
                                  {feature.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select
                                size="small"
                                fullWidth
                                value={mapping.availability || 'unavailable'}
                                onChange={(e) =>
                                  handleMappingChange(feature._id, 'availability', e.target.value)
                                }
                              >
                                <MenuItem value="unavailable">Unavailable</MenuItem>
                                <MenuItem value="standard">Available</MenuItem>
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
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

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
            queryClient.invalidateQueries({ queryKey: ['features'] });
          }}
          onCancel={() => setFeatureModalOpen(false)}
        />
      </QuickAddModal>
    </Box>
  );
};

export default Step3Features;
