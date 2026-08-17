import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVariantSpecifications, createVariantSpecification, updateSpecification } from '../../../api/specifications.api';

const specSchema = z.object({
  performance: z.object({
    topSpeedKph: z.number().optional().nullable(),
    acceleration0To100Kph: z.number().optional().nullable(),
  }).optional(),
  dimensions: z.object({
    lengthMm: z.number().optional().nullable(),
    widthMm: z.number().optional().nullable(),
    heightMm: z.number().optional().nullable(),
    wheelbaseMm: z.number().optional().nullable(),
    groundClearanceMm: z.number().optional().nullable(),
  }).optional(),
  capacity: z.object({
    bootSpaceLitres: z.number().optional().nullable(),
    fuelTankLitres: z.number().optional().nullable(),
  }).optional(),
  weight: z.object({
    kerbWeightKg: z.number().optional().nullable(),
    grossWeightKg: z.number().optional().nullable(),
  }).optional(),
  fuel: z.object({
    fuelEconomyCity: z.number().optional().nullable(),
    fuelEconomyHighway: z.number().optional().nullable(),
    fuelEconomyCombined: z.number().optional().nullable(),
    economyUnit: z.string().optional().nullable(),
  }).optional(),
  safety: z.object({
    airbags: z.number().optional().nullable(),
    abs: z.boolean().optional(),
    tractionControl: z.boolean().optional(),
    stabilityControl: z.boolean().optional(),
    parkingSensors: z.string().optional().nullable(),
    camera: z.string().optional().nullable(),
  }).optional(),
});

type SpecData = z.infer<typeof specSchema>;

interface Step2Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
}

const Step2Specifications: React.FC<Step2Props> = ({ variantId, onNext, onBack }) => {
  const queryClient = useQueryClient();
  const [specId, setSpecId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<SpecData>({
    resolver: zodResolver(specSchema),
    defaultValues: {
      performance: {},
      dimensions: {},
      capacity: {},
      weight: {},
      fuel: {},
      safety: { abs: false, tractionControl: false, stabilityControl: false }
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['specifications', variantId],
    queryFn: () => getVariantSpecifications(variantId),
    retry: 1
  });

  useEffect(() => {
    const spec = Array.isArray(data?.data) ? data.data[0] : data?.data;
    if (spec) {
      setSpecId(spec._id);
      reset({
        performance: spec.performance || {},
        dimensions: spec.dimensions || {},
        capacity: spec.capacity || {},
        weight: spec.weight || {},
        fuel: spec.fuel || {},
        safety: {
          airbags: spec.safety?.airbags,
          abs: spec.safety?.abs || false,
          tractionControl: spec.safety?.tractionControl || false,
          stabilityControl: spec.safety?.stabilityControl || false,
          parkingSensors: spec.safety?.parkingSensors,
          camera: spec.safety?.camera,
        }
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (formData: any) => createVariantSpecification(variantId, formData),
    onSuccess: (res) => {
      setSpecId(res.data._id);
      queryClient.invalidateQueries({ queryKey: ['specifications', variantId] });
      onNext();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (formData: any) => updateSpecification(specId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specifications', variantId] });
      onNext();
    }
  });

  const onSubmit = (formData: SpecData) => {
    // clean up nulls
    const cleanData = JSON.parse(JSON.stringify(formData));
    if (specId) {
      updateMutation.mutate(cleanData);
    } else {
      createMutation.mutate({ ...cleanData, variantId });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {(!data?.data || (Array.isArray(data?.data) && data.data.length === 0)) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No specifications found. A new specification document will be created.
        </Alert>
      )}
      
      <Stack spacing={4}>
        
        <Box>
          <Typography variant="h6" gutterBottom>Performance</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Controller
                name="performance.topSpeedKph"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Top Speed (km/h)"
                    type="number"
                    fullWidth
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="performance.acceleration0To100Kph"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="0-100 km/h (sec)"
                    type="number"
                    fullWidth
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Dimensions</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <Controller
                name="dimensions.lengthMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Length (mm)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.widthMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Width (mm)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.heightMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Height (mm)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.wheelbaseMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Wheelbase (mm)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.groundClearanceMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Ground Clearance (mm)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Capacities & Weights</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Controller
                name="capacity.bootSpaceLitres"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Boot Space (L)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="capacity.fuelTankLitres"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Fuel Tank (L)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="weight.kerbWeightKg"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Kerb Weight (kg)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="weight.grossWeightKg"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Gross Weight (kg)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Safety</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <Controller
                name="safety.airbags"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Number of Airbags" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="safety.parkingSensors"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Parking Sensors" placeholder="e.g. Front & Rear" fullWidth value={field.value || ''} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="safety.camera"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Camera" placeholder="e.g. 360 View" fullWidth value={field.value || ''} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="safety.abs"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="ABS" />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="safety.tractionControl"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Traction Control" />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="safety.stabilityControl"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Stability Control" />
                )}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button onClick={onBack} variant="outlined" disabled={isSaving}>
            Back
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default Step2Specifications;
