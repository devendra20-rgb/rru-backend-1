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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  TextField,
  IconButton,
  Stack,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getColors, getVariantColors, createVariantColor, updateVariantColor } from '../../../api/colors.api';
import type { Color, VariantColor } from '../../../api/colors.api';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QuickAddModal from '../../../components/common/QuickAddModal';
import ColorForm from '../../colors/ColorForm';

interface Step4Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

type ColorMapping = Partial<VariantColor> & { colorId: string };

const Step4Colors: React.FC<Step4Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();

  const { data: masterColorsData, isLoading: isLoadingMaster } = useQuery({
    queryKey: ['colors', 'all'],
    queryFn: () => getColors({ limit: 200, status: 'active' }),
  });

  const { data: mappedColorsData, isLoading: isLoadingMapped } = useQuery({
    queryKey: ['variant-colors', variantId],
    queryFn: () => getVariantColors(variantId),
  });

  // Only selected colors appear in the table
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, ColorMapping>>({});
  const [dirtyMappings, setDirtyMappings] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<Color | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [initialized, setInitialized] = useState(false);

  const colorsList: Color[] = masterColorsData?.data?.colors || [];
  const colorsById = useMemo(() => {
    const map: Record<string, Color> = {};
    colorsList.forEach((c) => {
      map[c._id] = c;
    });
    return map;
  }, [colorsList]);

  useEffect(() => {
    if (!masterColorsData?.data || !mappedColorsData?.data || initialized) return;

    const mappedData: any = mappedColorsData.data;
    const mappedList = Array.isArray(mappedData)
      ? mappedData
      : mappedData?.variantColors || mappedData?.colors || [];

    const nextMappings: Record<string, ColorMapping> = {};
    const nextSelected: string[] = [];

    mappedList.forEach((m: any) => {
      const colorId = (m.colorId as any)?._id || m.colorId;
      if (!colorId) return;
      // Treat previously available/optional mappings as selected
      if (m.availability && m.availability !== 'unavailable') {
        nextSelected.push(colorId);
        nextMappings[colorId] = {
          ...m,
          colorId,
          variantId,
        };
      } else if (m._id) {
        // Keep existing DB row so we can reactivate or soft-update later
        nextMappings[colorId] = {
          ...m,
          colorId,
          variantId,
        };
      }
    });

    setMappings(nextMappings);
    setSelectedColorIds(nextSelected);
    setInitialized(true);
  }, [masterColorsData, mappedColorsData, variantId, initialized]);

  const availableToAdd = useMemo(
    () => colorsList.filter((c) => !selectedColorIds.includes(c._id)),
    [colorsList, selectedColorIds],
  );

  const addColor = (color: Color, availability: 'standard' | 'optional' = 'standard') => {
    setSelectedColorIds((prev) => (prev.includes(color._id) ? prev : [...prev, color._id]));
    setMappings((prev) => ({
      ...prev,
      [color._id]: {
        ...(prev[color._id] || {}),
        variantId,
        colorId: color._id,
        availability,
        status: 'active',
      },
    }));
    setDirtyMappings((prev) => {
      const next = new Set(prev);
      next.add(color._id);
      return next;
    });
  };

  const removeColor = (colorId: string) => {
    setSelectedColorIds((prev) => prev.filter((id) => id !== colorId));
    setMappings((prev) => ({
      ...prev,
      [colorId]: {
        ...(prev[colorId] || { variantId, colorId }),
        availability: 'unavailable',
        status: prev[colorId]?.status || 'active',
      },
    }));
    setDirtyMappings((prev) => {
      const next = new Set(prev);
      next.add(colorId);
      return next;
    });
  };

  const handleMappingChange = (colorId: string, field: keyof VariantColor, value: any) => {
    setMappings((prev) => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        colorId,
        variantId,
        [field]: value,
      },
    }));
    setDirtyMappings((prev) => {
      const next = new Set(prev);
      next.add(colorId);
      return next;
    });
  };

  const saveMapping = async (mapping: ColorMapping) => {
    if (mapping._id) {
      await updateVariantColor(mapping._id, {
        availability: mapping.availability,
        status: mapping.status,
      });
    } else if (mapping.availability && mapping.availability !== 'unavailable') {
      await createVariantColor({
        variantId,
        colorId: mapping.colorId,
        availability: mapping.availability,
        status: mapping.status || 'active',
      });
    }
  };

  const handleSaveAndNext = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const promises = Array.from(dirtyMappings).map((colorId) => {
        const mapping = mappings[colorId];
        if (!mapping) return Promise.resolve();
        return saveMapping(mapping);
      });
      await Promise.all(promises);

      queryClient.invalidateQueries({ queryKey: ['variant-colors', variantId] });
      onNext();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to save color mappings');
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
      <Typography variant="body1" sx={{ mb: 3 }}>
        Search and add the colors offered for this vehicle. Only selected colors appear in the table below.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems={{ sm: 'flex-start' }}>
        <Autocomplete
          sx={{ flex: 1, minWidth: 240 }}
          options={availableToAdd}
          value={searchValue}
          inputValue={searchInput}
          onInputChange={(_, value) => setSearchInput(value)}
          onChange={(_, newValue) => {
            if (newValue) {
              addColor(newValue);
              setSearchValue(null);
              setSearchInput('');
            }
          }}
          getOptionLabel={(option) => {
            const parts = [option.name];
            if (option.colorCode) parts.push(option.colorCode);
            if (option.type) parts.push(option.type);
            return parts.join(' · ');
          }}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          filterOptions={(options, state) => {
            const q = state.inputValue.trim().toLowerCase();
            if (!q) return options.slice(0, 50);
            return options
              .filter((c) => {
                const haystack = [c.name, c.colorCode, c.colorFamily, c.finishType, c.type, c.hexCode]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase();
                return haystack.includes(q);
              })
              .slice(0, 50);
          }}
          renderOption={(props, option) => (
            <li {...props} key={option._id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: option.hexCode || '#ccc',
                    border: '1px solid #ccc',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {[option.colorCode, option.finishType, option.type].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Search colors to add"
              placeholder="Type a color name or code…"
            />
          )}
          noOptionsText={searchInput ? 'No matching colors' : 'Start typing to search colors'}
        />

        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setColorModalOpen(true)}>
          Add New Color
        </Button>
      </Stack>

      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="10%">Preview</TableCell>
                <TableCell width="28%">Color Name</TableCell>
                <TableCell width="18%">Color Code</TableCell>
                <TableCell width="34%">Availability</TableCell>
                <TableCell width="10%" align="right">
                  Remove
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedColorIds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No colors selected yet. Search above to add colors for this vehicle.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                selectedColorIds.map((colorId) => {
                  const mapping = mappings[colorId] || {};
                  const populated =
                    mapping.colorId && typeof mapping.colorId === 'object'
                      ? (mapping.colorId as any)
                      : null;
                  const color = colorsById[colorId] || populated;
                  return (
                    <TableRow key={colorId}>
                      <TableCell>
                        {color?.hexCode ? (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: color.hexCode,
                              border: '1px solid #ccc',
                            }}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {color?.name || 'Unknown color'}
                        </Typography>
                        {color?.finishType && (
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {color.finishType}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{color?.colorCode || '-'}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          value={mapping.availability === 'unavailable' ? 'standard' : mapping.availability || 'standard'}
                          onChange={(e) => handleMappingChange(colorId, 'availability', e.target.value)}
                        >
                          <MenuItem value="standard">Available</MenuItem>
                          <MenuItem value="optional">Optional</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Remove color"
                          onClick={() => removeColor(colorId)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
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
          onSuccess={async (createdId) => {
            setColorModalOpen(false);
            await queryClient.invalidateQueries({ queryKey: ['colors'] });
            // Refetch then add the new color to selection
            const refreshed = await queryClient.fetchQuery({
              queryKey: ['colors', 'all'],
              queryFn: () => getColors({ limit: 200, status: 'active' }),
            });
            const created = (refreshed?.data?.colors || []).find((c: Color) => c._id === createdId);
            if (created) {
              addColor(created);
            }
          }}
          onCancel={() => setColorModalOpen(false)}
        />
      </QuickAddModal>
    </Box>
  );
};

export default Step4Colors;
