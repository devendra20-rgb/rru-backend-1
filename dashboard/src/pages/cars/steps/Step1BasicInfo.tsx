import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVariant, createVariant, updateVariant } from '../../../api/variants.api';
import { getBrands } from '../../../api/brands.api';
import { getModels } from '../../../api/models.api';
import { getGenerations } from '../../../api/generations.api';

const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  variantCode: z.string().optional(),
  brandId: z.string().min(1, 'Brand is required'),
  modelId: z.string().min(1, 'Model is required'),
  generationId: z.string().min(1, 'Generation is required'),
  modelYear: z.number().int().optional(),
  bodyStyle: z.string().optional(),
  trimLevel: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

interface Step1Props {
  variantId: string | null;
  setVariantId: (id: string) => void;
  onNext: () => void;
}

const Step1BasicInfo: React.FC<Step1Props> = ({ variantId, setVariantId, onNext }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!variantId;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema) as any,
    defaultValues: {
      name: '',
      variantCode: '',
      brandId: '',
      modelId: '',
      generationId: '',
      status: 'draft'
    }
  });

  const selectedBrand = watch('brandId');
  const selectedModel = watch('modelId');

  // Fetch initial data if edit mode
  const { data, isLoading: isFetching, isError } = useQuery({
    queryKey: ['variant', variantId],
    queryFn: () => getVariant(variantId!),
    enabled: isEditMode
  });

  // Fetch dropdown options
  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ limit: 100 })
  });

  const { data: modelsData } = useQuery({
    queryKey: ['models', 'all', selectedBrand],
    queryFn: () => getModels({ limit: 100, brandId: selectedBrand || undefined }),
    enabled: !!selectedBrand
  });

  const { data: generationsData } = useQuery({
    queryKey: ['generations', 'all', selectedModel],
    queryFn: () => getGenerations({ limit: 100, modelId: selectedModel || undefined }),
    enabled: !!selectedModel
  });

  useEffect(() => {
    if (data?.data) {
      const variant = data.data as any;
      reset({
        name: variant.name,
        variantCode: variant.variantCode || '',
        brandId: variant.brandId?._id || variant.brandId || '',
        modelId: variant.modelId?._id || variant.modelId || '',
        generationId: variant.generationId?._id || variant.generationId || '',
        modelYear: variant.modelYear,
        bodyStyle: variant.bodyStyle || '',
        trimLevel: variant.trimLevel || '',
        status: variant.status
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) => createVariant(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      setVariantId(res.data._id);
      onNext();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateVariant(variantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['variant', variantId] });
      onNext();
    }
  });

  const onSubmit = (formData: any) => {
    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error || updateMutation.error;

  if (isFetching) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {isError && <Alert severity="error" sx={{ mb: 3 }}>Failed to load vehicle data.</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 3 }}>Failed to save vehicle.</Alert>}

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="brandId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.brandId}>
                <InputLabel>Brand *</InputLabel>
                <Select
                  {...field}
                  label="Brand *"
                  onChange={(e) => {
                    field.onChange(e);
                    setValue('modelId', '');
                    setValue('generationId', '');
                  }}
                >
                  {brandsData?.data.map((b) => (
                    <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                  ))}
                </Select>
                {errors.brandId && <FormHelperText>{errors.brandId.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="modelId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.modelId} disabled={!selectedBrand}>
                <InputLabel>Model *</InputLabel>
                <Select
                  {...field}
                  label="Model *"
                  onChange={(e) => {
                    field.onChange(e);
                    setValue('generationId', '');
                  }}
                >
                  {modelsData?.data.map((m) => (
                    <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
                  ))}
                </Select>
                {errors.modelId && <FormHelperText>{errors.modelId.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="generationId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.generationId} disabled={!selectedModel}>
                <InputLabel>Generation *</InputLabel>
                <Select {...field} label="Generation *">
                  {generationsData?.data.map((g) => (
                    <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
                  ))}
                </Select>
                {errors.generationId && <FormHelperText>{errors.generationId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Variant Name *"
                fullWidth
                placeholder="e.g. 330i M Sport"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="variantCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Variant Code"
                fullWidth
                placeholder="e.g. G20-330i-MSP"
                error={!!errors.variantCode}
                helperText={errors.variantCode?.message}
              />
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="modelYear"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Model Year"
                type="number"
                fullWidth
                error={!!errors.modelYear}
                helperText={errors.modelYear?.message}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            )}
          />

          <Controller
            name="bodyStyle"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.bodyStyle}>
                <InputLabel>Body Style</InputLabel>
                <Select {...field} label="Body Style">
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Sedan">Sedan</MenuItem>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="Coupe">Coupe</MenuItem>
                  <MenuItem value="Hatchback">Hatchback</MenuItem>
                  <MenuItem value="Convertible">Convertible</MenuItem>
                  <MenuItem value="Wagon">Wagon</MenuItem>
                  <MenuItem value="Pickup">Pickup</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                </Select>
                {errors.bodyStyle && <FormHelperText>{errors.bodyStyle.message}</FormHelperText>}
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
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default Step1BasicInfo;
