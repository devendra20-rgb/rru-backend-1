import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVariantSpecifications, createVariantSpecification, updateSpecification } from '../../../api/specifications.api';
import { customAttributesApi } from '../../../api/custom-attributes.api';
import { useToast } from '../../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../../utils/apiError';

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
  custom: z.array(
    z.object({
      category: z.string().min(1, 'Category is required'),
      name: z.string().min(1, 'Name is required'),
      value: z.string().min(1, 'Value is required'),
    })
  ).optional(),
  customAttributes: z.array(
    z.object({
      attributeId: z.string(),
      value: z.any()
    })
  ).optional()
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
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SpecData>({
    resolver: zodResolver(specSchema),
    defaultValues: {
      performance: {},
      dimensions: {},
      capacity: {},
      weight: {},
      fuel: {},
      safety: { abs: false, tractionControl: false, stabilityControl: false },
      custom: [],
      customAttributes: []
    }
  });

  const { fields: customFields, append: appendCustom, remove: removeCustom } = useFieldArray({
    control,
    name: 'custom'
  });

  const { data, isLoading: isLoadingSpec } = useQuery({
    queryKey: ['specifications', variantId],
    queryFn: () => getVariantSpecifications(variantId),
    retry: 1
  });

  const { data: customAttributesData, isLoading: isLoadingAttr } = useQuery({
    queryKey: ['custom-attributes-active'],
    queryFn: () => customAttributesApi.getAll({ isActive: true, limit: 1000 })
  });
  
  const customAttributesDef = customAttributesData?.data || [];

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
        },
        custom: spec.custom || [],
        customAttributes: spec.customAttributes?.map((ca: any) => ({
          attributeId: ca.attributeId?._id || ca.attributeId,
          value: ca.value
        })) || []
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (formData: any) => createVariantSpecification(variantId, formData),
    onSuccess: (res) => {
      setSpecId(res.data._id);
      queryClient.invalidateQueries({ queryKey: ['specifications', variantId] });
      showToast('Specifications saved successfully', 'success');
      onNext();
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (formData: any) => updateSpecification(specId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specifications', variantId] });
      showToast('Specifications updated successfully', 'success');
      onNext();
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
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

  if (isLoadingSpec || isLoadingAttr) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  // Helper to handle dynamic field changes
  const handleDynamicChange = (attributeId: string, value: any) => {
    const currentCustomAttributes = control._formValues.customAttributes || [];
    const existingIndex = currentCustomAttributes.findIndex((ca: any) => ca.attributeId === attributeId);
    
    let newCustomAttributes = [...currentCustomAttributes];
    if (existingIndex >= 0) {
      newCustomAttributes[existingIndex] = { attributeId, value };
    } else {
      newCustomAttributes.push({ attributeId, value });
    }
    reset({ ...control._formValues, customAttributes: newCustomAttributes });
  };
  
  // Helper to get dynamic field value
  const getDynamicValue = (attributeId: string, type: string) => {
    const currentCustomAttributes = control._formValues.customAttributes || [];
    const attr = currentCustomAttributes.find((ca: any) => ca.attributeId === attributeId);
    if (attr) return attr.value;
    
    if (type === 'boolean') return false;
    return '';
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      
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
                    value={field.value ?? ''}
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
                    value={field.value ?? ''}
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
                  <TextField {...field} label="Length (mm)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.widthMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Width (mm)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.heightMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Height (mm)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.wheelbaseMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Wheelbase (mm)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="dimensions.groundClearanceMm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Ground Clearance (mm)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
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
                  <TextField {...field} label="Boot Space (L)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="capacity.fuelTankLitres"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Fuel Tank (L)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="weight.kerbWeightKg"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Kerb Weight (kg)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="weight.grossWeightKg"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Gross Weight (kg)" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
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
                  <TextField {...field} label="Number of Airbags" type="number" fullWidth value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
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

        {customAttributesDef.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Additional Specifications</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {customAttributesDef.map((attr: any) => (
                <Box key={attr._id}>
                  {attr.type === 'text' || attr.type === 'number' ? (
                    <TextField
                      fullWidth
                      label={`${attr.name} ${attr.unit ? `(${attr.unit})` : ''}`}
                      type={attr.type === 'number' ? 'number' : 'text'}
                      value={getDynamicValue(attr._id, attr.type)}
                      onChange={(e) => {
                        const val = attr.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value;
                        handleDynamicChange(attr._id, val);
                      }}
                      required={attr.isRequired}
                      helperText={attr.description}
                    />
                  ) : attr.type === 'boolean' ? (
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={!!getDynamicValue(attr._id, attr.type)} 
                          onChange={(e) => handleDynamicChange(attr._id, e.target.checked)} 
                        />
                      }
                      label={attr.name}
                    />
                  ) : attr.type === 'select' ? (
                    <TextField
                      select
                      fullWidth
                      label={attr.name}
                      value={getDynamicValue(attr._id, attr.type)}
                      onChange={(e) => handleDynamicChange(attr._id, e.target.value)}
                      required={attr.isRequired}
                      helperText={attr.description}
                      slotProps={{ select: { native: true } }}
                    >
                      <option value=""></option>
                      {attr.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </TextField>
                  ) : null}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {customFields.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Legacy Custom Specifications</Typography>
            </Box>
            <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
              These are legacy fields. Please migrate them to Custom Attributes if needed.
            </Typography>
            <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            
            {customFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Controller
                  name={`custom.${index}.category`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      placeholder="e.g. Battery"
                      size="small"
                      error={!!errors?.custom?.[index]?.category}
                      helperText={errors?.custom?.[index]?.category?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name={`custom.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Attribute Name"
                      placeholder="e.g. Capacity"
                      size="small"
                      error={!!errors?.custom?.[index]?.name}
                      helperText={errors?.custom?.[index]?.name?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name={`custom.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Value"
                      placeholder="e.g. 75 kWh"
                      size="small"
                      error={!!errors?.custom?.[index]?.value}
                      helperText={errors?.custom?.[index]?.value?.message}
                      fullWidth
                    />
                  )}
                />
                <IconButton color="error" onClick={() => removeCustom(index)} sx={{ mt: 0.5 }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              ))}
          </Stack>
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
