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
  FormHelperText,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import CloseIcon from '@mui/icons-material/Close';
import { getBrand, createBrand, updateBrand } from '../../api/brands.api';
import FilePicker from '../../components/common/FilePicker';
import type { Media } from '../../api/media.api';

// Validation Schema
const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brandCode: z.string().min(1, 'Brand Code is required'),
  slug: z.string().min(1, 'Slug is required'),
  originCountryCode: z.string().length(2, 'Must be exactly 2 characters').optional().or(z.literal('')),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
  logoMediaId: z.string().optional()
});

type BrandFormData = z.infer<typeof brandSchema>;

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IT', name: 'Italy' },
  { code: 'FR', name: 'France' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'SE', name: 'Sweden' },
];

const BrandForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: '',
      brandCode: '',
      slug: '',
      originCountryCode: '',
      websiteUrl: '',
      status: 'active',
      logoMediaId: ''
    }
  });

  // Fetch brand data if in edit mode
  const { data, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ['brand', id],
    queryFn: () => getBrand(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const brand = data.data;
      reset({
        name: brand.name,
        brandCode: brand.brandCode,
        slug: brand.slug,
        originCountryCode: brand.originCountryCode || '',
        websiteUrl: brand.websiteUrl || '',
        status: brand.status,
        logoMediaId: brand.logoMediaId || ''
      });
      // Optionally fetch the media URL if logoMediaId exists (can be done directly or if the API returns populated logoMedia)
      if (brand.logoMediaId && typeof brand.logoMediaId === 'object') {
        setSelectedMediaUrl((brand.logoMediaId as any).url || '');
      }
    }
  }, [data, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: BrandFormData) => createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      navigate('/brands');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: BrandFormData) => updateBrand(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', id] });
      navigate('/brands');
    }
  });

  const onSubmit = (formData: any) => {
    const submitData = { ...formData };
    if (submitData.originCountryCode === '') delete submitData.originCountryCode;
    if (submitData.websiteUrl === '') delete submitData.websiteUrl;
    if (submitData.logoMediaId === '') delete submitData.logoMediaId;

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
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

      // Suggest a brand code (first 3 letters uppercase)
      if (value.length >= 3) {
        setValue('brandCode', value.substring(0, 3).toUpperCase(), { shouldValidate: true });
      }
    }
  };

  if (isFetching) {
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
          onClick={() => navigate('/brands')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Brand' : 'Add Brand'}
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching brand details'}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError instanceof Error ? saveError.message : 'Error saving brand'}
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
                  label="Brand Name *"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  onChange={(e) => handleNameChange(e as React.ChangeEvent<HTMLInputElement>, field.onChange)}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="brandCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Brand Code *"
                    fullWidth
                    error={!!errors.brandCode}
                    helperText={errors.brandCode?.message}
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
                name="originCountryCode"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.originCountryCode}>
                    <InputLabel>Country of Origin</InputLabel>
                    <Select {...field} label="Country of Origin">
                      <MenuItem value=""><em>None</em></MenuItem>
                      {COUNTRIES.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.originCountryCode && <FormHelperText>{errors.originCountryCode.message}</FormHelperText>}
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
              name="websiteUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Website URL"
                  fullWidth
                  error={!!errors.websiteUrl}
                  helperText={errors.websiteUrl?.message}
                />
              )}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Brand Logo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {selectedMediaUrl ? (
                  <Box sx={{ position: 'relative', width: 120, height: 120, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                    <img src={selectedMediaUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <IconButton
                      size="small"
                      color="error"
                      sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                      onClick={() => {
                        setSelectedMediaUrl('');
                        setValue('logoMediaId', '', { shouldValidate: true });
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<ImageSearchIcon />}
                    onClick={() => setFilePickerOpen(true)}
                    sx={{ height: 120, width: 120, borderStyle: 'dashed' }}
                  >
                    Select
                  </Button>
                )}
                {errors.logoMediaId && (
                  <FormHelperText error>{errors.logoMediaId.message}</FormHelperText>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/brands')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Brand'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      {/* File Picker Modal */}
      <FilePicker
        open={filePickerOpen}
        onClose={() => setFilePickerOpen(false)}
        folder="brands"
        onSelect={(media: Media) => {
          setSelectedMediaUrl(media.url);
          setValue('logoMediaId', media._id, { shouldValidate: true });
        }}
      />
    </Box>
  );
};

export default BrandForm;
