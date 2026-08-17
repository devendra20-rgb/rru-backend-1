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
import { getFeature, createFeature, updateFeature } from '../../api/features.api';

// Validation Schema
const featureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type FeatureFormData = z.infer<typeof featureSchema>;

const FeatureForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      description: '',
      status: 'active'
    }
  });

  const { data, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ['feature', id],
    queryFn: () => getFeature(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const feature = data.data;
      reset({
        name: feature.name,
        category: feature.category,
        description: feature.description || '',
        status: feature.status,
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FeatureFormData) => createFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      navigate('/features');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: FeatureFormData) => updateFeature(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['feature', id] });
      navigate('/features');
    }
  });

  const onSubmit = (formData: FeatureFormData) => {
    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
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

  // Pre-defined categories for features
  const categories = [
    { value: 'safety', label: 'Safety & Security' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'interior', label: 'Interior' },
    { value: 'comfort', label: 'Comfort' },
    { value: 'infotainment', label: 'Infotainment & Connectivity' },
    { value: 'convenience', label: 'Convenience' },
    { value: 'performance', label: 'Performance' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/features')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Feature' : 'Add Feature'}
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching feature details'}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError instanceof Error ? saveError.message : 'Error saving feature'}
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
                  label="Feature Name *"
                  fullWidth
                  placeholder="e.g. Adaptive Cruise Control, Sunroof"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category *</InputLabel>
                    <Select {...field} label="Category *">
                      {categories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                      ))}
                    </Select>
                    {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
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
                  rows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/features')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Feature'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default FeatureForm;
