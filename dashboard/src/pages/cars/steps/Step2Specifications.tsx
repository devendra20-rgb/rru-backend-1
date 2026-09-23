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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVariantSpecifications, createVariantSpecification, updateSpecification } from '../../../api/specifications.api';
import { getVariant } from '../../../api/variants.api';
import type { CustomAttribute } from '../../../api/custom-attributes.api';
import { getCustomAttributes } from '../../../api/custom-attributes.api';

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
    adas: z.boolean().optional(),
    parkingSensors: z.string().optional().nullable(),
    camera: z.string().optional().nullable(),
  }).optional(),
  electric: z.object({
    batteryCapacity: z.number().optional().nullable(),
    usableBatteryCapacity: z.number().optional().nullable(),
    motorType: z.string().optional().nullable(),
    motorConfiguration: z.string().optional().nullable(),
    wltpRange: z.number().optional().nullable(),
    drivingRange: z.number().optional().nullable(),
    cityRange: z.number().optional().nullable(),
    highwayRange: z.number().optional().nullable(),
    batteryVoltage: z.number().optional().nullable(),
    acChargingPower: z.number().optional().nullable(),
    dcChargingPower: z.number().optional().nullable(),
    acChargingTime: z.number().optional().nullable(),
    dcChargingTime: z.number().optional().nullable(),
    chargingPort: z.string().optional().nullable(),
    chargingTime10To80: z.number().optional().nullable(),
    energyConsumption: z.number().optional().nullable(),
    regenerativeBraking: z.boolean().optional(),
    onboardCharger: z.string().optional().nullable(),
    vehicleToLoad: z.boolean().optional(),
    vehicleToGrid: z.boolean().optional(),
    heatPump: z.boolean().optional(),
  }).optional(),
  customAttributes: z.record(z.string(), z.any()).optional(),
});

type SpecData = z.infer<typeof specSchema>;

interface Step2Props {
  variantId: string;
  onNext: () => void;
  onBack: () => void;
  isNewVehicle?: boolean;
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
      safety: { abs: false, tractionControl: false, stabilityControl: false, adas: false },
      electric: {
        regenerativeBraking: false,
        vehicleToLoad: false,
        vehicleToGrid: false,
        heatPump: false,
      }
    }
  });

  const { data: variantData } = useQuery({
    queryKey: ['variant', variantId],
    queryFn: () => getVariant(variantId),
    enabled: !!variantId,
  });

  const fuelType = variantData?.data?.fuelType;
  const isEV = fuelType === 'electric';
  const isPlugInHybrid = fuelType === 'plug_in_hybrid';
  const isHybrid = fuelType === 'hybrid' || isPlugInHybrid;
  const isElectricOrHybrid = isEV || isHybrid;

  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ['specifications', variantId],
    queryFn: () => getVariantSpecifications(variantId),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    }
  });

  const { data: customAttrsData, isLoading: isLoadingAttrs } = useQuery({
    queryKey: ['custom-attributes', 'active', 'variant'],
    queryFn: () => getCustomAttributes({ status: 'active', appliesTo: 'variant', limit: 100 }),
  });

  const activeCustomAttributes: CustomAttribute[] = customAttrsData?.data || [];

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
          adas: spec.safety?.adas || false,
          parkingSensors: spec.safety?.parkingSensors,
          camera: spec.safety?.camera,
        },
        electric: {
          batteryCapacity: spec.electric?.batteryCapacity,
          usableBatteryCapacity: spec.electric?.usableBatteryCapacity,
          motorType: spec.electric?.motorType,
          motorConfiguration: spec.electric?.motorConfiguration,
          wltpRange: spec.electric?.wltpRange,
          drivingRange: spec.electric?.drivingRange,
          cityRange: spec.electric?.cityRange,
          highwayRange: spec.electric?.highwayRange,
          batteryVoltage: spec.electric?.batteryVoltage,
          acChargingPower: spec.electric?.acChargingPower,
          dcChargingPower: spec.electric?.dcChargingPower,
          acChargingTime: spec.electric?.acChargingTime,
          dcChargingTime: spec.electric?.dcChargingTime,
          chargingPort: spec.electric?.chargingPort,
          chargingTime10To80: spec.electric?.chargingTime10To80,
          energyConsumption: spec.electric?.energyConsumption,
          regenerativeBraking: spec.electric?.regenerativeBraking || false,
          onboardCharger: spec.electric?.onboardCharger,
          vehicleToLoad: spec.electric?.vehicleToLoad || false,
          vehicleToGrid: spec.electric?.vehicleToGrid || false,
          heatPump: spec.electric?.heatPump || false,
        },
        customAttributes: spec.customAttributes || {},
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
  const saveError = createMutation.error || updateMutation.error;
  const is404 = (fetchError as any)?.response?.status === 404;
  const queryErrorToDisplay = fetchError && !is404 ? fetchError : null;

  if (isLoading || isLoadingAttrs) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {queryErrorToDisplay && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {queryErrorToDisplay instanceof Error ? queryErrorToDisplay.message : 'Failed to load specifications.'}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError instanceof Error ? saveError.message : 'Failed to save specifications.'}
        </Alert>
      )}
      
      <Stack spacing={4}>
        
        {/* Performance Section */}
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

        {/* Dimensions Section */}
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

        {/* Capacities & Weights Section */}
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
            {!isEV && (
              <Box>
                <Controller
                  name="capacity.fuelTankLitres"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Fuel Tank (L)" type="number" fullWidth value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  )}
                />
              </Box>
            )}
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

        {/* Fuel Economy Section (Hide for pure EV) */}
        {!isEV && (
          <Box>
            <Typography variant="h6" gutterBottom>Fuel Economy</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Controller
                  name="fuel.fuelEconomyCity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City Economy"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="fuel.fuelEconomyHighway"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Highway Economy"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="fuel.fuelEconomyCombined"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Combined Economy"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="fuel.economyUnit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Economy Unit</InputLabel>
                      <Select
                        {...field}
                        label="Economy Unit"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      >
                        <MenuItem value="">Not set</MenuItem>
                        <MenuItem value="km/l">km/l</MenuItem>
                        <MenuItem value="l/100km">l/100km</MenuItem>
                        <MenuItem value="mpg">mpg</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Battery & Range Section (EV and Hybrid/Plug-in Hybrid) */}
        {isElectricOrHybrid && (
          <Box>
            <Typography variant="h6" gutterBottom>Battery & Range</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Controller
                  name="electric.batteryCapacity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Battery Capacity (kWh)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.usableBatteryCapacity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Usable Battery Capacity (kWh)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.batteryVoltage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Battery Voltage (V)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.wltpRange"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="WLTP Range (km)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.drivingRange"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Driving Range (km)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.cityRange"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City Range (km)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.highwayRange"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Highway Range (km)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.energyConsumption"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Energy Consumption (kWh/100 km)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Charging Section (EV and Plug-in Hybrid) */}
        {(isEV || isPlugInHybrid) && (
          <Box>
            <Typography variant="h6" gutterBottom>Charging</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Controller
                  name="electric.chargingPort"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      freeSolo
                      options={['CCS2', 'Type 2', 'NACS', 'CHAdeMO', 'GB/T']}
                      value={field.value || ''}
                      onChange={(_, value) => field.onChange(value)}
                      onInputChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField {...params} label="Charging Port" placeholder="e.g. CCS2" fullWidth />
                      )}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.acChargingPower"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="AC Charging Power (kW)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.dcChargingPower"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="DC Fast Charging Power (kW)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.acChargingTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="AC Charging Time (minutes)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.dcChargingTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="DC Fast Charging Time (minutes)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.chargingTime10To80"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="10–80% Charging Time (minutes)"
                      type="number"
                      fullWidth
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.onboardCharger"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="On-board Charger"
                      placeholder="e.g. 11 kW"
                      fullWidth
                      value={field.value || ''}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* EV Powertrain & Technology Section */}
        {isElectricOrHybrid && (
          <Box>
            <Typography variant="h6" gutterBottom>EV Motor & Technology</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Controller
                  name="electric.motorType"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      freeSolo
                      options={[
                        'Permanent Magnet Synchronous Motor',
                        'AC Induction Motor',
                        'Separately Excited Synchronous Motor',
                        'Switched Reluctance Motor',
                      ]}
                      value={field.value || ''}
                      onChange={(_, value) => field.onChange(value)}
                      onInputChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField {...params} label="Motor Type" placeholder="e.g. Permanent Magnet Synchronous" fullWidth />
                      )}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.motorConfiguration"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      freeSolo
                      options={['Single Motor', 'Dual Motor', 'Tri Motor', 'Quad Motor']}
                      value={field.value || ''}
                      onChange={(_, value) => field.onChange(value)}
                      onInputChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField {...params} label="Motor Configuration" placeholder="e.g. Dual Motor" fullWidth />
                      )}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.regenerativeBraking"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label="Regenerative Braking"
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.vehicleToLoad"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label="Vehicle-to-Load (V2L)"
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.vehicleToGrid"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label="Vehicle-to-Grid (V2G)"
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="electric.heatPump"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label="Heat Pump"
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Safety Section */}
        <Box>
          <Typography variant="h6" gutterBottom>Safety</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <Controller
                name="safety.airbags"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Number of Airbags" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="safety.parkingSensors"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={['Front', 'Rear', 'Front + Rear', '360° / Surround Parking Sensors', 'Not Available']}
                    value={field.value || ''}
                    onChange={(_, value) => field.onChange(value)}
                    onInputChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Parking Sensors" placeholder="e.g. Front & Rear" fullWidth />
                    )}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="safety.camera"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={['Front Camera', 'Rear Camera', 'Front + Rear Camera', '360° / Surround View Camera', 'Multiple Cameras', 'Dash Camera', 'Not Available']}
                    value={field.value || ''}
                    onChange={(_, value) => field.onChange(value)}
                    onInputChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Camera" placeholder="e.g. 360 View" fullWidth />
                    )}
                  />
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
            <Box>
              <Controller
                name="safety.adas"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="ADAS" />
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* Custom Attributes Section */}
        {activeCustomAttributes.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Additional Specifications</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {activeCustomAttributes.map((attr) => (
                <Box key={attr.key}>
                  <Controller
                    name={`customAttributes.${attr.key}`}
                    control={control}
                    render={({ field }) => {
                      if (attr.type === 'boolean') {
                        return (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!!field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            }
                            label={attr.name}
                          />
                        );
                      }
                      
                      if (attr.type === 'select') {
                        return (
                          <FormControl fullWidth>
                            <InputLabel>{attr.name}</InputLabel>
                            <Select
                              {...field}
                              label={attr.name}
                              value={field.value || ''}
                            >
                              <MenuItem value=""><em>None</em></MenuItem>
                              {attr.options?.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        );
                      }

                      if (attr.type === 'multi-select') {
                        const valArray = Array.isArray(field.value) ? field.value : [];
                        return (
                          <FormControl fullWidth>
                            <InputLabel>{attr.name}</InputLabel>
                            <Select
                              {...field}
                              multiple
                              label={attr.name}
                              value={valArray}
                              onChange={(e) => field.onChange(e.target.value)}
                            >
                              {attr.options?.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        );
                      }

                      return (
                        <TextField
                          {...field}
                          label={attr.name}
                          type={attr.type === 'number' ? 'number' : 'text'}
                          fullWidth
                          value={field.value ?? ''}
                          onChange={(e) => {
                            if (attr.type === 'number') {
                              field.onChange(e.target.value ? Number(e.target.value) : null);
                            } else {
                              field.onChange(e.target.value);
                            }
                          }}
                          slotProps={attr.unit ? {
                            input: {
                              endAdornment: <InputAdornment position="end">{attr.unit}</InputAdornment>,
                            }
                          } : undefined}
                          helperText={attr.description}
                        />
                      );
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

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
