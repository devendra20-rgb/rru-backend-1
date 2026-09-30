import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeatures, getVariantFeatures, bulkSaveVariantFeatures } from '../../../api/features.api';
import type { VariantFeature } from '../../../api/features.api';
import QuickAddModal from '../../../components/common/QuickAddModal';
import FeatureForm from '../../features/FeatureForm';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';

interface Step3Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

interface ImportResultItem {
  featureName: string;
  matchedFeatureName?: string;
  availability: 'standard' | 'optional' | 'unavailable';
  value: string;
  status: 'passed' | 'failed';
  reason?: string;
}

interface ImportReport {
  total: number;
  passedCount: number;
  failedCount: number;
  items: ImportResultItem[];
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

// Clean string for fuzzy matching (removes acronyms, parentheses, and punctuation)
const normalizeString = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();

const Step3Features: React.FC<Step3Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();

  const { data: masterFeaturesData, isLoading: isLoadingMaster } = useQuery({
    queryKey: ['features', 'all'],
    queryFn: () => getFeatures({ limit: 1000, status: 'active' }),
  });

  const { data: mappedFeaturesData, isLoading: isLoadingMapped } = useQuery({
    queryKey: ['variant-features', variantId],
    queryFn: () => getVariantFeatures(variantId),
  });

  const [mappings, setMappings] = useState<Record<string, Partial<VariantFeature>>>({});
  const [dirtyMappings, setDirtyMappings] = useState<Set<string>>(new Set());
  const dirtyMappingsRef = useRef(dirtyMappings);
  dirtyMappingsRef.current = dirtyMappings;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // File Upload & Validation Report state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<'all' | 'failed' | 'passed'>('all');

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

        initialMappings[feature._id] = existing
          ? {
              ...existing,
              variantId,
              // API populates featureId as an object — keep a plain string for saves
              featureId: feature._id,
            }
          : {
              variantId,
              featureId: feature._id,
              availability: 'unavailable',
              value: '',
              status: 'active',
            };
      });

      setMappings((prev) => {
        const next = { ...initialMappings };
        // Preserve any in-memory dirty changes made by the user before refetch
        dirtyMappingsRef.current.forEach((featureId) => {
          if (prev[featureId]) {
            next[featureId] = prev[featureId];
          }
        });
        return next;
      });
    }
  }, [masterFeaturesData, mappedFeaturesData, variantId]);

  const masterFeaturesList = masterFeaturesData?.data?.features || [];

  const masterCategoryStats = useMemo(() => {
    const stats: Record<string, { configured: number; total: number }> = {};
    masterFeaturesList.forEach((f: any) => {
      const cat = f.category || 'other';
      if (!stats[cat]) stats[cat] = { configured: 0, total: 0 };
      stats[cat].total += 1;
      if (mappings[f._id]?.availability && mappings[f._id]?.availability !== 'unavailable') {
        stats[cat].configured += 1;
      }
    });
    return stats;
  }, [masterFeaturesList, mappings]);

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

  const handleAccordionChange =
    (category: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedCategories((prev) =>
        isExpanded ? [...prev, category] : prev.filter((c) => c !== category),
      );
    };

  const expandAll = () => setExpandedCategories(groupedFeatures.map((g) => g.category));
  const collapseAll = () => setExpandedCategories([]);

  // Matching helper: exact match -> normalized match -> substring match
  const findMasterFeature = (inputName: string, featuresList: any[]) => {
    if (!inputName || !inputName.trim()) return null;
    const cleanInput = inputName.trim();
    const cleanInputLower = cleanInput.toLowerCase();

    // 1. Exact case-insensitive match
    let match = featuresList.find((f: any) => f.name?.trim().toLowerCase() === cleanInputLower);
    if (match) return match;

    // 2. Normalized name match (strips acronyms, parenthetical text, and punctuation)
    const normInput = normalizeString(cleanInput);
    if (normInput) {
      match = featuresList.find((f: any) => normalizeString(f.name || '') === normInput);
      if (match) return match;
    }

    // 3. Substring / contains match
    match = featuresList.find(
      (f: any) =>
        f.name?.toLowerCase().includes(cleanInputLower) ||
        cleanInputLower.includes(f.name?.toLowerCase()),
    );
    return match || null;
  };

  // Availability normalization helper
  const resolveAvailability = (availRaw: string, _detailsRaw?: string): 'standard' | 'optional' | 'unavailable' => {
    const s = (availRaw || '').trim().toLowerCase();
    if (
      s === 'standard' ||
      s === 'available' ||
      s === 'yes' ||
      s === 'y' ||
      s === 'true' ||
      s === '1' ||
      s === 's'
    ) {
      return 'standard';
    }
    if (s === 'optional' || s === 'opt' || s === 'o') {
      return 'optional';
    }
    if (s === 'unavailable' || s === 'no' || s === 'n' || s === 'false' || s === '0') {
      return 'unavailable';
    }
    // Empty/blank fields are treated as unavailable
    return 'unavailable';
  };

  // CSV Text Parser (handles quotes and headers)
  const parseCSVText = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 1) return [];

    const parseLine = (line: string): string[] => {
      const row: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim().replace(/^"|"$/g, ''));
      return row;
    };

    const firstRow = parseLine(lines[0]);
    const isHeader = firstRow.some((col) => /feature|name|availab|detail|status|value/i.test(col));
    const headers = isHeader ? firstRow : ['Feature/Name', 'Availablity', 'Additional Details'];
    const startIdx = isHeader ? 1 : 0;

    const rows: Record<string, string>[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.every((v) => !v.trim())) continue;
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      // Fallbacks by column position if keys match expected headers
      if (!rowObj['Feature/Name'] && values[0]) rowObj['Feature/Name'] = values[0];
      if (!rowObj['Availablity'] && values[1]) rowObj['Availablity'] = values[1];
      if (!rowObj['Additional Details'] && values[2]) rowObj['Additional Details'] = values[2];
      rows.push(rowObj);
    }
    return rows;
  };

  // JSON Text Parser
  const parseJSONText = (text: string): Record<string, string>[] => {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map((item) => {
      const obj: Record<string, string> = {};
      Object.keys(item).forEach((k) => {
        obj[k] = String(item[k] ?? '');
      });
      return obj;
    });
  };

  // Main Import Processor
  const processImportRows = (rows: Record<string, string>[]) => {
    const results: ImportResultItem[] = [];
    let passedCount = 0;
    let failedCount = 0;

    const nextMappings = { ...mappings };
    const nextDirty = new Set(dirtyMappingsRef.current);

    rows.forEach((row) => {
      const keys = Object.keys(row);
      const nameKey = keys.find((k) => /feature|name/i.test(k)) || keys[0];
      const availKey = keys.find((k) => /availab|status/i.test(k)) || keys[1];
      const detailKey = keys.find((k) => /detail|value|note|extra/i.test(k)) || keys[2];

      const rawName = nameKey ? row[nameKey]?.trim() : '';
      const rawAvail = availKey ? row[availKey]?.trim() : '';
      const rawDetails = detailKey ? row[detailKey]?.trim() : '';

      if (!rawName) {
        failedCount++;
        results.push({
          featureName: '(Empty Row)',
          availability: 'unavailable',
          value: '',
          status: 'failed',
          reason: 'Feature name is missing or empty in row',
        });
        return;
      }

      const matched = findMasterFeature(rawName, masterFeaturesList);

      if (!matched) {
        failedCount++;
        results.push({
          featureName: rawName,
          availability: resolveAvailability(rawAvail, rawDetails),
          value: rawDetails,
          status: 'failed',
          reason: `Feature name "${rawName}" did not match any feature in master catalog (needs to be added first from dashboard).`,
        });
        return;
      }

      const availability = resolveAvailability(rawAvail, rawDetails);

      // Select dropdown & additional details in frontend state immediately
      nextMappings[matched._id] = {
        ...nextMappings[matched._id],
        availability,
        value: rawDetails,
      };
      nextDirty.add(matched._id);

      passedCount++;
      results.push({
        featureName: rawName,
        matchedFeatureName: matched.name,
        availability,
        value: rawDetails,
        status: 'passed',
      });
    });

    setMappings(nextMappings);
    setDirtyMappings(nextDirty);
    setImportReport({
      total: rows.length,
      passedCount,
      failedCount,
      items: results,
    });
    setImportTab(failedCount > 0 ? 'failed' : 'all');
    setImportModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        let rows: Record<string, string>[] = [];
        if (file.name.endsWith('.json')) {
          rows = parseJSONText(text);
        } else {
          rows = parseCSVText(text);
        }
        processImportRows(rows);
      } catch (err: any) {
        setError(`Failed to parse file: ${err.message}`);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSaveAndNext = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Collect only dirty (changed) mappings into a single bulk payload
      const items = Array.from(dirtyMappings)
        .map((featureId) => {
          const mapping = mappings[featureId];
          if (!mapping) return null;
          const rawId = mapping.featureId as any;
          const resolvedFeatureId =
            typeof rawId === 'string' ? rawId : rawId?._id ? String(rawId._id) : featureId;
          return {
            featureId: resolvedFeatureId,
            availability: (mapping.availability ?? 'unavailable') as
              | 'standard'
              | 'optional'
              | 'unavailable',
            value: mapping.value ?? '',
            status: 'active' as const,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

      if (items.length > 0) {
        // Single HTTP request replaces N individual POST/PATCH calls
        await bulkSaveVariantFeatures(variantId, items);
      }

      setDirtyMappings(new Set());
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
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          alignItems: { sm: 'center' },
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
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload CSV / JSON
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.json,.txt"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
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
          const stats = masterCategoryStats[category] || { configured: 0, total: features.length };
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
                                  sx={{ display: 'block' }}
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

      {/* Import Results & Validation Dialog */}
      <Dialog
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            CSV / JSON Feature Import Summary
          </Typography>
          <IconButton size="small" onClick={() => setImportModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {importReport && (
            <Box>
              {/* Summary Stats Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    TOTAL PROCESSED
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {importReport.total}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9', color: '#2e7d32' }}>
                  <Typography variant="caption" color="inherit" sx={{ fontWeight: 600 }}>
                    PASSED & APPLIED
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {importReport.passedCount}
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: importReport.failedCount > 0 ? '#ffebee' : 'grey.100',
                    color: importReport.failedCount > 0 ? '#c62828' : 'text.primary',
                  }}
                >
                  <Typography variant="caption" color="inherit" sx={{ fontWeight: 600 }}>
                    FAILED / UNMATCHED
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {importReport.failedCount}
                  </Typography>
                </Paper>
              </Box>

              {/* Filter Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={importTab} onChange={(_, v) => setImportTab(v)}>
                  <Tab label={`All (${importReport.items.length})`} value="all" />
                  <Tab
                    label={`Failed (${importReport.failedCount})`}
                    value="failed"
                    sx={{ color: importReport.failedCount > 0 ? 'error.main' : 'inherit' }}
                  />
                  <Tab label={`Passed (${importReport.passedCount})`} value="passed" />
                </Tabs>
              </Box>

              {/* Items Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Feature Name in File</TableCell>
                      <TableCell>Matched Catalog Feature</TableCell>
                      <TableCell>Availability</TableCell>
                      <TableCell>Additional Details</TableCell>
                      <TableCell>Reason / Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importReport.items
                      .filter((item) => {
                        if (importTab === 'failed') return item.status === 'failed';
                        if (importTab === 'passed') return item.status === 'passed';
                        return true;
                      })
                      .map((item, idx) => (
                        <TableRow
                          key={idx}
                          sx={{ bgcolor: item.status === 'failed' ? '#fff8f8' : 'inherit' }}
                        >
                          <TableCell>
                            {item.status === 'passed' ? (
                              <Chip
                                size="small"
                                icon={<CheckCircleIcon />}
                                label="Passed"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                size="small"
                                icon={<ErrorIcon />}
                                label="Failed"
                                color="error"
                                variant="filled"
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{item.featureName}</TableCell>
                          <TableCell>{item.matchedFeatureName || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={item.availability}
                              color={
                                item.availability === 'standard'
                                  ? 'primary'
                                  : item.availability === 'optional'
                                  ? 'info'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>{item.value || '—'}</TableCell>
                          <TableCell
                            sx={{
                              color: item.status === 'failed' ? 'error.main' : 'text.secondary',
                              fontSize: '0.8rem',
                            }}
                          >
                            {item.reason || 'Successfully matched & dropdown selected'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          {importReport && importReport.failedCount > 0 ? (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setImportModalOpen(false);
                setFeatureModalOpen(true);
              }}
            >
              Add New Feature to Master Catalog
            </Button>
          ) : (
            <Box />
          )}
          <Button variant="contained" onClick={() => setImportModalOpen(false)}>
            Close & Review Form
          </Button>
        </DialogActions>
      </Dialog>

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
