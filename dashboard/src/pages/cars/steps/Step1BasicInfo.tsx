import React, { useEffect, useState } from 'react';
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
  Stack,
  Typography,
  Divider
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVariant, createVariant, updateVariant } from '../../../api/variants.api';
import { getBrands } from '../../../api/brands.api';
import { getModels } from '../../../api/models.api';
import { getGenerations } from '../../../api/generations.api';
import { AsyncSelect } from '../../../components/common/AsyncSelect';
import { useToast } from '../../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../../utils/apiError';

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
  const { showToast } = useToast();
  const isEditMode = !!variantId;

  const [brandObj, setBrandObj] = useState<{ _id: string; name: string } | null>(null);
  const [modelObj, setModelObj] = useState<{ _id: string; name: string } | null>(null);
  const [generationObj, setGenerationObj] = useState<{ _id: string; name: string } | null>(null);

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

  const selectedBrandId = watch('brandId');
  const selectedModelId = watch('modelId');

  const { data, isLoading: isFetching, isError } = useQuery({
    queryKey: ['variant', variantId],
    queryFn: () => getVariant(variantId!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const variant = data.data as any;
      
      const bId = variant.model?.brandId?._id || variant.model?.brandId || '';
      const bName = variant.model?.brandId?.name || '';
      const mId = variant.model?._id || '';
      const mName = variant.model?.name || '';
      const gId = variant.generationId?._id || variant.generationId || '';
      const gName = variant.generationId?.name || '';

      setBrandObj(bId ? { _id: bId, name: bName } : null);
      setModelObj(mId ? { _id: mId, name: mName } : null);
      setGenerationObj(gId ? { _id: gId, name: gName } : null);

      reset({
        name: variant.name,
        variantCode: variant.variantCode || '',
        brandId: bId,
        modelId: mId,
        generationId: gId,
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
      showToast('Vehicle variant created successfully', 'success');
      setVariantId(res.data._id);
      onNext();
    },
    onError: (err: any) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateVariant(variantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['variant', variantId] });
      showToast('Vehicle variant updated successfully', 'success');
      onNext();
    },
    onError: (err: any) => {
      showToast(getReadableErrorMessage(err), 'error');
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

  if (isFetching) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getReadableErrorMessage(new Error('Failed to load vehicle data'))}
        </Alert>
      )}

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="brandId"
              control={control}
              render={({ field }) => (
                <AsyncSelect<any>
                  label="Brand *"
                  placeholder="Select Brand"
                  value={brandObj}
                  onChange={(val) => {
                    setBrandObj(val);
                    field.onChange(val?._id || '');
                    // Reset cascading fields
                    setValue('modelId', '');
                    setModelObj(null);
                    setValue('generationId', '');
                    setGenerationObj(null);
                  }}
                  fetchOptions={async (q) => {
                    const res = await getBrands({ search: q, limit: 20 });
                    return res.data;
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  error={!!errors.brandId}
                  helperText={errors.brandId?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Controller
              name="modelId"
              control={control}
              render={({ field }) => (
                <AsyncSelect<any>
                  label="Model *"
                  placeholder="Select Model"
                  disabled={!selectedBrandId}
                  value={modelObj}
                  onChange={(val) => {
                    setModelObj(val);
                    field.onChange(val?._id || '');
                    // Reset cascading field
                    setValue('generationId', '');
                    setGenerationObj(null);
                  }}
                  fetchOptions={async (q) => {
                    if (!selectedBrandId) return [];
                    const res = await getModels({ search: q, brandId: selectedBrandId, limit: 20 });
                    return res.data;
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  error={!!errors.modelId}
                  helperText={errors.modelId?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Controller
              name="generationId"
              control={control}
              render={({ field }) => (
                <AsyncSelect<any>
                  label="Generation *"
                  placeholder="Select Generation"
                  disabled={!selectedModelId}
                  value={generationObj}
                  onChange={(val) => {
                    setGenerationObj(val);
                    field.onChange(val?._id || '');
                  }}
                  fetchOptions={async (q) => {
                    if (!selectedModelId) return [];
                    const res = await getGenerations({ search: q, modelId: selectedModelId, limit: 20 });
                    return res.data;
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  error={!!errors.generationId}
                  helperText={errors.generationId?.message}
                />
              )}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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
                label="Variant Code *"
                fullWidth
                placeholder="e.g. G20-330i-MSP"
                error={!!errors.variantCode}
                helperText={errors.variantCode?.message}
              />
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
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
              <TextField {...field} label="Full Description" fullWidth multiline rows={4} value={field.value || ''} />
            )}
          />
        </Box>

        {/* Powertrain Configuration */}
        <Box sx={{ mt: 3, mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            Powertrain Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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
