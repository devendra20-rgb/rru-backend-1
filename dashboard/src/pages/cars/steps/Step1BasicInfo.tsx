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
  variantCode: z.string().min(1, 'Variant code is required'),
  brandId: z.string().min(1, 'Brand is required'),
  modelId: z.string().min(1, 'Model is required'),
  generationId: z.string().min(1, 'Generation is required'),
  modelYear: z.number().int().optional(),
  fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'cng', 'lpg', 'other']).optional(),
  transmissionType: z.enum(['manual', 'automatic', 'cvt', 'dct', 'amt', 'other']).optional(),
  drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd', 'other']).optional(),
  engine: z.object({
    displacementCc: z.number().optional(),
    cylinders: z.number().optional(),
    aspiration: z.string().optional(),
    powerHp: z.number().optional(),
    torqueNm: z.number().optional(),
  }).optional(),
  seatingCapacity: z.number().int().optional(),
  doors: z.number().int().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
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
      fuelType: undefined,
      transmissionType: undefined,
      drivetrain: undefined,
      engine: {
        displacementCc: undefined,
        cylinders: undefined,
        aspiration: undefined,
        powerHp: undefined,
        torqueNm: undefined,
      },
      description: '',
      shortDescription: '',
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
        fuelType: variant.fuelType,
        transmissionType: variant.transmissionType,
        drivetrain: variant.drivetrain,
        engine: variant.engine || {},
        seatingCapacity: variant.seatingCapacity,
        doors: variant.doors,
        description: variant.description || '',
        shortDescription: variant.shortDescription || '',
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
    const submitData = { ...formData };
    
    if (submitData.description === '') delete submitData.description;
    if (submitData.shortDescription === '') delete submitData.shortDescription;
    if (submitData.fuelType === '') delete submitData.fuelType;
    if (submitData.transmissionType === '') delete submitData.transmissionType;
    if (submitData.drivetrain === '') delete submitData.drivetrain;
    
    if (submitData.engine) {
      if (submitData.engine.aspiration === '') delete submitData.engine.aspiration;
    }

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
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
                value={field.value ?? ''}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status" value={field.value || 'draft'}>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="shortDescription"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Short Description" fullWidth multiline rows={2} value={field.value || ''} />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Full Description" fullWidth multiline rows={2} value={field.value || ''} />
            )}
          />
        </Box>

        {/* Powertrain Configuration */}
        <Box sx={{ mt: 2, mb: 1 }}><Alert severity="info">Powertrain Configuration</Alert></Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="fuelType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Fuel Type</InputLabel>
                <Select {...field} label="Fuel Type" value={field.value || ''}>
                  <MenuItem value="">None</MenuItem>
                  {['petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'cng', 'lpg', 'other'].map(v => <MenuItem key={v} value={v}>{v.replace(/_/g, ' ').toUpperCase()}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="transmissionType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Transmission</InputLabel>
                <Select {...field} label="Transmission" value={field.value || ''}>
                  <MenuItem value="">None</MenuItem>
                  {['manual', 'automatic', 'cvt', 'dct', 'amt', 'other'].map(v => <MenuItem key={v} value={v}>{v.toUpperCase()}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="drivetrain"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Drivetrain</InputLabel>
                <Select {...field} label="Drivetrain" value={field.value || ''}>
                  <MenuItem value="">None</MenuItem>
                  {['fwd', 'rwd', 'awd', '4wd', 'other'].map(v => <MenuItem key={v} value={v}>{v.toUpperCase()}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="engine.displacementCc"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Displacement (CC)" type="number" fullWidth onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
            )}
          />
          <Controller
            name="engine.cylinders"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Cylinders" type="number" fullWidth onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
            )}
          />
          <Controller
            name="engine.aspiration"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Aspiration" placeholder="e.g. Turbocharged" fullWidth value={field.value || ''} />
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="engine.powerHp"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Power (HP)" type="number" fullWidth onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
            )}
          />
          <Controller
            name="engine.torqueNm"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Torque (Nm)" type="number" fullWidth onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
            )}
          />
        </Box>

        {/* Body Configuration */}
        <Box sx={{ mt: 2, mb: 1 }}><Alert severity="info">Body Configuration</Alert></Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="doors"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Doors" type="number" fullWidth onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
            )}
          />
          <Controller
            name="seatingCapacity"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Seating Capacity" type="number" fullWidth onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} />
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
