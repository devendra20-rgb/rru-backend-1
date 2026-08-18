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
import { getGeneration, createGeneration, updateGeneration } from '../../api/generations.api';
import { getBrands } from '../../api/brands.api';
import { getModels } from '../../api/models.api';

// Validation Schema
const generationSchema = z.object({
  modelId: z.string().min(1, 'Model is required'),
  name: z.string().min(1, 'Name is required'),
  generationCode: z.string().min(1, 'Generation Code is required'),
  slug: z.string().min(1, 'Slug is required'),
  generationNumber: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1).optional()),
  startYear: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1900).max(2100).optional()),
  endYear: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1900).max(2100).optional()),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
});

type GenerationFormData = z.infer<typeof generationSchema>;

const GenerationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state for dependent dropdowns
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ limit: 1000 })
  });

  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: ['models', 'all', selectedBrandId],
    queryFn: () => getModels({ limit: 1000, brandId: selectedBrandId }),
    enabled: !!selectedBrandId
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<GenerationFormData>({
    resolver: zodResolver(generationSchema) as any,
    defaultValues: {
      modelId: '',
      name: '',
      generationCode: '',
      slug: '',
      generationNumber: undefined,
      startYear: undefined,
      endYear: undefined,
      description: '',
      status: 'draft'
    }
  });

  // Fetch generation data if in edit mode
  const { data, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ['generation', id],
    queryFn: () => getGeneration(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const gen = data.data;
      const model = gen.modelId as any;
      
      // If the backend returns populated model, we can extract brandId to set the dependent dropdown
      if (model && typeof model === 'object' && model.brandId) {
        setSelectedBrandId(typeof model.brandId === 'string' ? model.brandId : model.brandId._id);
      }

      reset({
        modelId: typeof gen.modelId === 'string' ? gen.modelId : gen.modelId?._id || '',
        name: gen.name,
        generationCode: gen.generationCode,
        slug: gen.slug,
        generationNumber: gen.generationNumber,
        startYear: gen.startYear,
        endYear: gen.endYear,
        description: gen.description || '',
        status: gen.status,
      });
    }
  }, [data, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: GenerationFormData) => createGeneration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      navigate('/generations');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: GenerationFormData) => updateGeneration(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      queryClient.invalidateQueries({ queryKey: ['generation', id] });
      navigate('/generations');
    }
  });

  const onSubmit = (formData: GenerationFormData) => {
    const submitData = { ...formData } as any;
    if (submitData.description === '') delete submitData.description;

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error || updateMutation.error;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value;
    onChange(value);
    
    if (!isEditMode) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
      
      if (value.length >= 2) {
        setValue('generationCode', value.substring(0, 4).toUpperCase(), { shouldValidate: true });
      }
    }
  };

  const handleBrandChange = (e: any) => {
    setSelectedBrandId(e.target.value);
    // Clear the model selection when brand changes
    setValue('modelId', '');
  };

  if (isFetching || isLoadingBrands) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/generations')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Generation' : 'Add Generation'}
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching generation details'}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError instanceof Error ? saveError.message : 'Error saving generation'}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            
            {/* Dependent Dropdowns */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Brand *</InputLabel>
                <Select 
                  value={selectedBrandId} 
                  label="Brand *" 
                  onChange={handleBrandChange}
                >
                  <MenuItem value="" disabled>Select a brand</MenuItem>
                  {brandsData?.data?.map((brand) => (
                    <MenuItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Controller
                name="modelId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.modelId} disabled={!selectedBrandId || isLoadingModels}>
                    <InputLabel>Model *</InputLabel>
                    <Select {...field} label="Model *">
                      <MenuItem value="" disabled>Select a model</MenuItem>
                      {modelsData?.data?.map((model) => (
                        <MenuItem key={model._id} value={model._id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.modelId && <FormHelperText>{errors.modelId.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Generation Name *"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  onChange={(e) => handleNameChange(e as React.ChangeEvent<HTMLInputElement>, field.onChange)}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="generationCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Generation Code *"
                    fullWidth
                    error={!!errors.generationCode}
                    helperText={errors.generationCode?.message}
                  />
                )}
              />

              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Slug *"
                    fullWidth
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="startYear"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Start Year"
                    fullWidth
                    error={!!errors.startYear}
                    helperText={errors.startYear?.message}
                  />
                )}
              />

              <Controller
                name="endYear"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="End Year"
                    fullWidth
                    error={!!errors.endYear}
                    helperText={errors.endYear?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="generationNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Generation Number (e.g. 8)"
                    fullWidth
                    error={!!errors.generationNumber}
                    helperText={errors.generationNumber?.message}
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/generations')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Generation'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default GenerationForm;
