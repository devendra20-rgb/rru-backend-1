import React, { useEffect, useRef, useState } from 'react';
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
  Divider,
  IconButton,
  Autocomplete,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QuickAddModal from '../../../components/common/QuickAddModal';
import BrandForm from '../../brands/BrandForm';
import ModelForm from '../../models/ModelForm';
import GenerationForm from '../../generations/GenerationForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVariant,
  createVariant,
  updateVariant,
  getVariantTemplate,
  populateVariantFromSource,
} from '../../../api/variants.api';
import { getBrands } from '../../../api/brands.api';
import { getModels } from '../../../api/models.api';
import { getGenerations } from '../../../api/generations.api';

const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  variantCode: z.string().optional(),
  brandId: z.string().min(1, 'Brand is required'),
  modelId: z.string().min(1, 'Model is required'),
  generationId: z.string().optional(),
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
  /** True when route is /cars/new (create flow), even after draft variantId is assigned */
  isNewVehicle?: boolean;
}

const emptyEngine = {
  displacementCc: undefined as number | undefined,
  cylinders: undefined as number | undefined,
  aspiration: undefined as string | undefined,
  powerHp: undefined as number | undefined,
  torqueNm: undefined as number | undefined,
};

const Step1BasicInfo: React.FC<Step1Props> = ({
  variantId,
  setVariantId,
  onNext,
  isNewVehicle = false,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!variantId;

  // Modals state
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [generationModalOpen, setGenerationModalOpen] = useState(false);

  // Auto-populate
  const [autoPopulate, setAutoPopulate] = useState(false);
  const [sourceVariantId, setSourceVariantId] = useState<string | null>(null);
  const [autoPopulateMessage, setAutoPopulateMessage] = useState<string | null>(null);
  const [autoPopulateSeverity, setAutoPopulateSeverity] = useState<'info' | 'success' | 'warning'>('info');
  const [isLookingUpTemplate, setIsLookingUpTemplate] = useState(false);
  const lastTemplateKeyRef = useRef<string>('');
  const pendingPopulateRef = useRef<string | null>(null);

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
      engine: { ...emptyEngine },
      description: '',
      shortDescription: '',
      status: 'draft'
    }
  });

  const selectedBrand = watch('brandId');
  const selectedModel = watch('modelId');
  const selectedGeneration = watch('generationId');

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
        brandId: variant.model?.brandId?._id || variant.model?.brandId || '',
        modelId: variant.model?._id || variant.modelId?._id || variant.modelId || '',
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

  const clearTemplateDerivedFields = () => {
    setValue('modelYear', undefined);
    setValue('fuelType', undefined);
    setValue('transmissionType', undefined);
    setValue('drivetrain', undefined);
    setValue('engine', { ...emptyEngine });
    setValue('seatingCapacity', undefined);
    setValue('doors', undefined);
    setValue('description', '');
    setValue('shortDescription', '');
  };

  const applyTemplateToForm = (
    source: NonNullable<Awaited<ReturnType<typeof getVariantTemplate>>['data']>['sourceVariant'],
  ) => {
    if (!source) return;
    // Keep current name / status / variantCode — do not overwrite unique fields
    if (source.modelYear !== undefined) setValue('modelYear', source.modelYear);
    if (source.fuelType) setValue('fuelType', source.fuelType as any);
    if (source.transmissionType) setValue('transmissionType', source.transmissionType as any);
    if (source.drivetrain) setValue('drivetrain', source.drivetrain as any);
    if (source.engine) {
      setValue('engine', {
        displacementCc: source.engine.displacementCc,
        cylinders: source.engine.cylinders,
        aspiration: source.engine.aspiration,
        powerHp: source.engine.powerHp,
        torqueNm: source.engine.torqueNm,
      });
    }
    if (source.seatingCapacity !== undefined) setValue('seatingCapacity', source.seatingCapacity);
    if (source.doors !== undefined) setValue('doors', source.doors);
    if (source.description !== undefined) setValue('description', source.description || '');
    if (source.shortDescription !== undefined) setValue('shortDescription', source.shortDescription || '');
  };

  // Lookup template when switch is ON and Brand + Model (+ optional Generation) are selected
  useEffect(() => {
    if (!autoPopulate || !isNewVehicle) {
      return;
    }

    if (!selectedBrand || !selectedModel) {
      setSourceVariantId(null);
      setAutoPopulateMessage(null);
      lastTemplateKeyRef.current = '';
      return;
    }

    const templateKey = `${selectedModel}:${selectedGeneration || ''}`;
    if (lastTemplateKeyRef.current === templateKey) {
      return;
    }
    lastTemplateKeyRef.current = templateKey;

    let cancelled = false;

    const run = async () => {
      setIsLookingUpTemplate(true);
      setAutoPopulateMessage(null);
      setSourceVariantId(null);
      // Clear previously auto-filled fields so stale data from another combo cannot linger
      clearTemplateDerivedFields();

      try {
        const res = await getVariantTemplate({
          modelId: selectedModel,
          generationId: selectedGeneration || undefined,
          excludeVariantId: variantId || undefined,
        });
        if (cancelled) return;

        const result = res.data;
        if (result?.found && result.sourceVariant && result.sourceVariantId) {
          applyTemplateToForm(result.sourceVariant);
          setSourceVariantId(result.sourceVariantId);
          setAutoPopulateSeverity('success');
          setAutoPopulateMessage(
            result.message ||
              `Loaded template from "${result.sourceVariant._sourceName || 'existing vehicle'}". All steps will be pre-filled; you can still edit everything.`,
          );
        } else {
          setSourceVariantId(null);
          setAutoPopulateSeverity('warning');
          setAutoPopulateMessage(
            result?.message ||
              'No existing vehicle found for this Brand, Model, and Generation. Continue with manual entry.',
          );
        }
      } catch (err: any) {
        if (cancelled) return;
        setSourceVariantId(null);
        setAutoPopulateSeverity('warning');
        setAutoPopulateMessage(
          err?.response?.data?.message ||
            'Could not look up an existing vehicle. You can continue entering data manually.',
        );
      } finally {
        if (!cancelled) setIsLookingUpTemplate(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPopulate, selectedBrand, selectedModel, selectedGeneration, isNewVehicle, variantId]);

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await createVariant(formData);
      const newId = res.data._id;
      const sourceId = pendingPopulateRef.current;
      if (sourceId) {
        try {
          await populateVariantFromSource(newId, sourceId);
        } catch (err) {
          console.error('Failed to auto-populate related vehicle data', err);
          throw Object.assign(
            new Error(
              'Vehicle created, but auto-populate of related data failed. You can continue filling steps manually.',
            ),
            { cause: err, createdVariantId: newId },
          );
        }
      }
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      setVariantId(res.data._id);
      pendingPopulateRef.current = null;
      onNext();
    },
    onError: (err: any) => {
      if (err?.createdVariantId) {
        setVariantId(err.createdVariantId);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await updateVariant(variantId!, formData);
      const sourceId = pendingPopulateRef.current;
      if (sourceId && autoPopulate && isNewVehicle) {
        try {
          await populateVariantFromSource(variantId!, sourceId);
        } catch (err) {
          console.error('Failed to auto-populate related vehicle data', err);
        }
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['variant', variantId] });
      queryClient.invalidateQueries({ queryKey: ['specifications', variantId] });
      queryClient.invalidateQueries({ queryKey: ['variant-features', variantId] });
      queryClient.invalidateQueries({ queryKey: ['variant-colors', variantId] });
      queryClient.invalidateQueries({ queryKey: ['variant-markets', variantId] });
      queryClient.invalidateQueries({ queryKey: ['variant-media', variantId] });
      pendingPopulateRef.current = null;
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

    if (submitData.generationId === '') submitData.generationId = null;
    if (submitData.variantCode === '') delete submitData.variantCode;

    pendingPopulateRef.current =
      autoPopulate && isNewVehicle && sourceVariantId ? sourceVariantId : null;

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleAutoPopulateToggle = (checked: boolean) => {
    setAutoPopulate(checked);
    lastTemplateKeyRef.current = '';
    if (!checked) {
      setSourceVariantId(null);
      setAutoPopulateMessage(null);
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
      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError instanceof Error ? saveError.message : 'Failed to save vehicle.'}
        </Alert>
      )}

      <Stack spacing={3}>
        {isNewVehicle && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.default',
            }}
          >
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoPopulate}
                    onChange={(e) => handleAutoPopulateToggle(e.target.checked)}
                    color="primary"
                  />
                }
                label="Auto-populate existing data"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 1.5 }}>
                When enabled, selecting Brand, Model, and Generation loads matching vehicle data into every step. Images are reused, not re-uploaded.
              </Typography>
            </Box>
            {isLookingUpTemplate && <CircularProgress size={22} />}
          </Box>
        )}

        {autoPopulate && autoPopulateMessage && (
          <Alert severity={autoPopulateSeverity}>{autoPopulateMessage}</Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flex: 1 }}>
            <Controller
              name="brandId"
              control={control}
              render={({ field }) => {
                const selectedOption = brandsData?.data?.find((b: any) => b._id === field.value) || null;
                return (
                  <Autocomplete
                    options={brandsData?.data || []}
                    getOptionLabel={(option: any) => option.name || ''}
                    value={selectedOption}
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue._id : '');
                      setValue('modelId', '');
                      setValue('generationId', '');
                      lastTemplateKeyRef.current = '';
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Brand *" 
                        error={!!errors.brandId} 
                        helperText={errors.brandId?.message} 
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-listbox': { maxHeight: 250 } }}
                    fullWidth
                    isOptionEqualToValue={(option: any, value: any) => option._id === value._id}
                  />
                );
              }}
            />
            <IconButton color="primary" sx={{ mt: 1 }} onClick={() => setBrandModalOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>


          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flex: 1 }}>
            <Controller
              name="modelId"
              control={control}
              render={({ field }) => {
                const selectedOption = modelsData?.data?.find((m: any) => m._id === field.value) || null;
                return (
                  <Autocomplete
                    options={modelsData?.data || []}
                    getOptionLabel={(option: any) => option.name || ''}
                    value={selectedOption}
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue._id : '');
                      setValue('generationId', '');
                      lastTemplateKeyRef.current = '';
                    }}
                    disabled={!selectedBrand}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Model *" 
                        error={!!errors.modelId} 
                        helperText={errors.modelId?.message} 
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-listbox': { maxHeight: 250 } }}
                    fullWidth
                    isOptionEqualToValue={(option: any, value: any) => option._id === value._id}
                  />
                );
              }}
            />
            <IconButton color="primary" sx={{ mt: 1 }} disabled={!selectedBrand} onClick={() => setModelModalOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flex: 1 }}>
            <Controller
              name="generationId"
              control={control}
              render={({ field }) => {
                const selectedOption = generationsData?.data?.find((g: any) => g._id === field.value) || null;
                return (
                  <Autocomplete
                    options={generationsData?.data || []}
                    getOptionLabel={(option: any) => option.name || ''}
                    value={selectedOption}
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue._id : '');
                      lastTemplateKeyRef.current = '';
                    }}
                    disabled={!selectedModel}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Generation (Optional)" 
                        error={!!errors.generationId} 
                        helperText={errors.generationId?.message} 
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-listbox': { maxHeight: 250 } }}
                    fullWidth
                    isOptionEqualToValue={(option: any, value: any) => option._id === value._id}
                  />
                );
              }}
            />
            <IconButton color="primary" sx={{ mt: 1 }} disabled={!selectedModel} onClick={() => setGenerationModalOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>
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
                placeholder="Auto-generated by system"
                disabled={true}
                error={!!errors.variantCode}
                helperText={field.value ? "Auto-generated code" : "Will be generated on save"}
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
        <Box sx={{ mt: 3, mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            Powertrain Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Box>

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
          <Button type="submit" variant="contained" disabled={isSaving || isLookingUpTemplate}>
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Box>
      </Stack>

      <QuickAddModal open={brandModalOpen} onClose={() => setBrandModalOpen(false)} title="Quick Add Brand">
        <BrandForm 
          onSuccess={(id) => {
            setValue('brandId', id, { shouldValidate: true });
            setValue('modelId', '');
            setValue('generationId', '');
            lastTemplateKeyRef.current = '';
            setBrandModalOpen(false);
          }}
          onCancel={() => setBrandModalOpen(false)}
        />
      </QuickAddModal>

      <QuickAddModal open={modelModalOpen} onClose={() => setModelModalOpen(false)} title="Quick Add Model">
        <ModelForm
          initialData={{ brandId: selectedBrand || undefined }}
          onSuccess={(id) => {
            setValue('modelId', id, { shouldValidate: true });
            setValue('generationId', '');
            lastTemplateKeyRef.current = '';
            setModelModalOpen(false);
          }}
          onCancel={() => setModelModalOpen(false)}
        />
      </QuickAddModal>

      <QuickAddModal open={generationModalOpen} onClose={() => setGenerationModalOpen(false)} title="Quick Add Generation">
        <GenerationForm
          initialData={{ brandId: selectedBrand || undefined, modelId: selectedModel || undefined }}
          onSuccess={(id) => {
            setValue('generationId', id, { shouldValidate: true });
            lastTemplateKeyRef.current = '';
            setGenerationModalOpen(false);
          }}
          onCancel={() => setGenerationModalOpen(false)}
        />
      </QuickAddModal>
    </Box>
  );
};

export default Step1BasicInfo;
