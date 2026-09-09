import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getColor, createColor, updateColor } from '../../api/colors.api';

const PRESET_FINISH_TYPES = ['solid', 'metallic', 'matte', 'pearlescent'] as const;
const CUSTOM_FINISH_VALUE = '__custom__';

// Validation Schema
const hexCodeRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const colorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  colorCode: z.string().min(1, 'Color Code is required'),
  hexCode: z.string().regex(hexCodeRegex, 'Must be a valid hex color (e.g. #FF0000 or #F00)'),
  colorFamily: z.string().optional(),
  finishType: z.string().max(50).optional(),
  type: z.enum(['exterior', 'interior']),
  status: z.enum(['active', 'inactive']).default('active'),
});

type ColorFormData = z.infer<typeof colorSchema>;

export interface ColorFormProps {
  onSuccess?: (createdId: string) => void;
  onCancel?: () => void;
}

const isPresetFinishType = (value?: string) =>
  !!value && (PRESET_FINISH_TYPES as readonly string[]).includes(value);

const ColorForm: React.FC<ColorFormProps> = ({ onSuccess, onCancel }) => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [useCustomFinish, setUseCustomFinish] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema) as any,
    defaultValues: {
      name: '',
      colorCode: '',
      hexCode: '',
      colorFamily: '',
      finishType: 'solid',
      type: 'exterior',
      status: 'active'
    }
  });

  const finishTypeValue = watch('finishType');

  const { data, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ['color', id],
    queryFn: () => getColor(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const color = data.data;
      const finish = color.finishType || 'solid';
      reset({
        name: color.name,
        colorCode: color.colorCode || '',
        hexCode: color.hexCode || '',
        colorFamily: color.colorFamily || '',
        finishType: finish,
        type: color.type || 'exterior',
        status: color.status,
      });
      setUseCustomFinish(!!finish && !isPresetFinishType(finish));
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) => createColor(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      if (onSuccess) onSuccess(res.data._id);
      else navigate('/colors');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateColor(id!, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      queryClient.invalidateQueries({ queryKey: ['color', id] });
      if (onSuccess) onSuccess(res.data._id);
      else navigate('/colors');
    }
  });

  const onSubmit = async (data: ColorFormData) => {
    const trimmedFinish = data.finishType?.trim() || '';
    const submitData = {
      ...data,
      finishType: trimmedFinish === '' ? undefined : trimmedFinish,
      colorFamily: data.colorFamily === '' ? undefined : data.colorFamily
    } as any;
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync(submitData);
    } else {
      await createMutation.mutateAsync(submitData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error || updateMutation.error;

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const colorFamilies = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Other'
  ];

  const colorTypes = [
    { value: 'exterior', label: 'Exterior' },
    { value: 'interior', label: 'Interior' }
  ];

  const finishSelectValue = useCustomFinish ? CUSTOM_FINISH_VALUE : (finishTypeValue || '');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => onCancel ? onCancel() : navigate('/colors')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Color' : 'Add Color'}
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching color details'}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError instanceof Error ? saveError.message : 'Error saving color'}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Color Name *"
                  fullWidth
                  placeholder="e.g. Alpine White"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="colorCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Manufacturer Color Code *"
                    fullWidth
                    placeholder="e.g. 300"
                    error={!!errors.colorCode}
                    helperText={errors.colorCode?.message}
                  />
                )}
              />

              <Controller
                name="hexCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hex Code *"
                    fullWidth
                    placeholder="e.g. #FFFFFF"
                    error={!!errors.hexCode}
                    helperText={errors.hexCode?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Controller
                name="colorFamily"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.colorFamily}>
                    <InputLabel>Color Family</InputLabel>
                    <Select {...field} label="Color Family">
                      <MenuItem value="">None</MenuItem>
                      {colorFamilies.map((fam) => (
                        <MenuItem key={fam} value={fam}>{fam}</MenuItem>
                      ))}
                    </Select>
                    {errors.colorFamily && <FormHelperText>{errors.colorFamily.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <FormControl fullWidth error={!!errors.finishType}>
                  <InputLabel>Finish Type</InputLabel>
                  <Select
                    label="Finish Type"
                    value={finishSelectValue}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next === CUSTOM_FINISH_VALUE) {
                        setUseCustomFinish(true);
                        // Clear preset value so user enters a custom one
                        if (isPresetFinishType(finishTypeValue) || !finishTypeValue) {
                          setValue('finishType', '');
                        }
                      } else {
                        setUseCustomFinish(false);
                        setValue('finishType', next);
                      }
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {PRESET_FINISH_TYPES.map((finish) => (
                      <MenuItem key={finish} value={finish} sx={{ textTransform: 'capitalize' }}>
                        {finish}
                      </MenuItem>
                    ))}
                    <MenuItem value={CUSTOM_FINISH_VALUE}>Custom…</MenuItem>
                  </Select>
                  {errors.finishType && !useCustomFinish && (
                    <FormHelperText>{errors.finishType.message}</FormHelperText>
                  )}
                </FormControl>

                {useCustomFinish && (
                  <Controller
                    name="finishType"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || ''}
                        label="Custom Finish Type"
                        placeholder="e.g. satin, gloss, chrome"
                        fullWidth
                        autoFocus
                        error={!!errors.finishType}
                        helperText={errors.finishType?.message || 'Enter a custom finish type'}
                      />
                    )}
                  />
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Type *</InputLabel>
                    <Select {...field} label="Type *">
                      {colorTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                    {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl sx={{ width: '50%' }} error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => onCancel ? onCancel() : navigate('/colors')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Color'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ColorForm;
