import React, { useEffect } from 'react';
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
import { getModel, createModel, updateModel } from '../../api/models.api';
import { getBrands } from '../../api/brands.api';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

// Validation Schema
const modelSchema = z.object({
  brandId: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Name is required'),
  modelCode: z.string().min(1, 'Model Code is required'),
  slug: z.string().min(1, 'Slug is required'),
  bodyType: z.string().optional(),
  segment: z.string().optional(),
  launchYear: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1900).max(2100).optional()),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
});

type ModelFormData = z.infer<typeof modelSchema>;

const ModelForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch Brands for dependent dropdown
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ limit: 1000 })
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema) as any,
    defaultValues: {
      brandId: '',
      name: '',
      modelCode: '',
      slug: '',
      bodyType: '',
      segment: '',
      launchYear: undefined,
      description: '',
      shortDescription: '',
      status: 'draft'
    }
  });

  // Fetch model data if in edit mode
  const { data, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ['model', id],
    queryFn: () => getModel(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const model = data.data;
      reset({
        brandId: typeof model.brandId === 'string' ? model.brandId : model.brandId?._id || '',
        name: model.name,
        modelCode: model.modelCode,
        slug: model.slug,
        bodyType: model.bodyType || '',
        segment: model.segment || '',
        launchYear: model.launchYear,
        description: model.description || '',
        shortDescription: model.shortDescription || '',
        status: model.status,
      });
    }
  }, [data, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ModelFormData) => createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      showToast('Model created successfully', 'success');
      navigate('/models');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: ModelFormData) => updateModel(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['model', id] });
      showToast('Model updated successfully', 'success');
      navigate('/models');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const onSubmit = (formData: ModelFormData) => {
    const submitData = { ...formData } as any;
    if (submitData.bodyType === '') delete submitData.bodyType;
    if (submitData.segment === '') delete submitData.segment;
    if (submitData.description === '') delete submitData.description;
    if (submitData.shortDescription === '') delete submitData.shortDescription;

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const onFormError = () => {
    showToast('Please fix the highlighted fields before saving.', 'error');
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error || updateMutation.error;

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value;
    onChange(value);
    
    if (!isEditMode) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
      
      // Suggest a model code
      if (value.length >= 2) {
        setValue('modelCode', value.substring(0, 4).toUpperCase(), { shouldValidate: true });
      }
    }
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
          onClick={() => navigate('/models')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Model' : 'Add Model'}
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getReadableErrorMessage(error)}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit, onFormError)}>
          <Stack spacing={3}>
            
            <Controller
              name="brandId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.brandId}>
                  <InputLabel>Brand *</InputLabel>
                  <Select {...field} label="Brand *">
                    <MenuItem value="" disabled>Select a brand</MenuItem>
                    {brandsData?.data?.map((brand) => (
                      <MenuItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.brandId && <FormHelperText>{errors.brandId.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Model Name *"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  onChange={(e) => handleNameChange(e as React.ChangeEvent<HTMLInputElement>, field.onChange)}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="modelCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Model Code *"
                    fullWidth
                    error={!!errors.modelCode}
                    helperText={errors.modelCode?.message}
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
                name="bodyType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.bodyType}>
                    <InputLabel>Body Type</InputLabel>
                    <Select {...field} label="Body Type">
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Sedan">Sedan</MenuItem>
                      <MenuItem value="SUV">SUV</MenuItem>
                      <MenuItem value="Coupe">Coupe</MenuItem>
                      <MenuItem value="Hatchback">Hatchback</MenuItem>
                      <MenuItem value="Convertible">Convertible</MenuItem>
                      <MenuItem value="Wagon">Wagon</MenuItem>
                      <MenuItem value="Pickup">Pickup</MenuItem>
                      <MenuItem value="Van">Van</MenuItem>
                    </Select>
                    {errors.bodyType && <FormHelperText>{errors.bodyType.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="segment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Segment"
                    fullWidth
                    placeholder="e.g. C-Segment"
                    error={!!errors.segment}
                    helperText={errors.segment?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="launchYear"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Launch Year"
                    fullWidth
                    error={!!errors.launchYear}
                    helperText={errors.launchYear?.message}
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
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Short Description"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.shortDescription}
                  helperText={errors.shortDescription?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Description"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/models')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Model'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ModelForm;
