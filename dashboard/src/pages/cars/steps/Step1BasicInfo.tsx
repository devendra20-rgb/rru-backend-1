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
  InputAdornment,
  Autocomplete,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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
  getVariantBySlug,
  type VariantTemplateCandidate,
} from '../../../api/variants.api';
import { getBrands } from '../../../api/brands.api';
import { getModels } from '../../../api/models.api';
import { getGenerations } from '../../../api/generations.api';
import { buildDefaultSlug, findUniqueSlug, slugify } from '../../../utils/variantSlug';

const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  variantCode: z.string().optional(),
  slug: z.string().optional(),
  brandId: z.string().min(1, 'Brand is required'),
  modelId: z.string().min(1, 'Model is required'),
  generationId: z.string().optional(),
  modelYear: z.number().int().optional(),
  fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'cng', 'lpg', 'other']).optional(),
  transmissionType: z.string().optional(),
  drivetrain: z.string().optional(),
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
  const [templateCandidates, setTemplateCandidates] = useState<VariantTemplateCandidate[]>([]);
  const [autoPopulateMessage, setAutoPopulateMessage] = useState<string | null>(null);
  const [autoPopulateSeverity, setAutoPopulateSeverity] = useState<'info' | 'success' | 'warning'>('info');
  const [isLookingUpTemplate, setIsLookingUpTemplate] = useState(false);
  const lastTemplateKeyRef = useRef<string>('');
  const pendingPopulateRef = useRef<string | null>(null);

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [slugNotice, setSlugNotice] = useState<string | null>(null);

  const [isCustomTransmission, setIsCustomTransmission] = useState<boolean>(false);
  const [transmissionSelect, setTransmissionSelect] = useState<string>('');
  const [customTransmission, setCustomTransmission] = useState<string>('');

  const [isCustomDrivetrain, setIsCustomDrivetrain] = useState<boolean>(false);
  const [drivetrainSelect, setDrivetrainSelect] = useState<string>('');
  const [customDrivetrain, setCustomDrivetrain] = useState<string>('');

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
      slug: '',
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
  const watchedName = watch('name');

  // Fetch initial data if edit mode
  const { data, isLoading: isFetching, isError } = useQuery({
    queryKey: ['variant', variantId],
    queryFn: () => getVariant(variantId!),
    enabled: isEditMode
  });

  // Fetch dropdown options
  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ limit: 1000 })
  });

  const { data: modelsData } = useQuery({
    queryKey: ['models', 'all', selectedBrand],
    queryFn: () => getModels({ limit: 1000, brandId: selectedBrand || undefined }),
    enabled: !!selectedBrand
  });

  const { data: generationsData } = useQuery({
    queryKey: ['generations', 'all', selectedModel],
    queryFn: () => getGenerations({ limit: 1000, modelId: selectedModel || undefined }),
    enabled: !!selectedModel
  });

  useEffect(() => {
    if (data?.data) {
      const variant = data.data as any;
      const rawTransmission = variant.transmissionType || '';
      const stdTransmissions = ['manual', 'automatic', 'cvt', 'dct', 'amt'];
      if (stdTransmissions.includes(rawTransmission)) {
        setIsCustomTransmission(false);
        setTransmissionSelect(rawTransmission);
        setCustomTransmission('');
      } else if (rawTransmission) {
        setIsCustomTransmission(true);
        setTransmissionSelect('custom');
        setCustomTransmission(rawTransmission);
      } else {
        setIsCustomTransmission(false);
        setTransmissionSelect('');
        setCustomTransmission('');
      }

      const rawDrivetrain = variant.drivetrain || '';
      const stdDrivetrains = ['fwd', 'rwd', 'awd', '4wd'];
      if (stdDrivetrains.includes(rawDrivetrain)) {
        setIsCustomDrivetrain(false);
        setDrivetrainSelect(rawDrivetrain);
        setCustomDrivetrain('');
      } else if (rawDrivetrain) {
        setIsCustomDrivetrain(true);
        setDrivetrainSelect('custom');
        setCustomDrivetrain(rawDrivetrain);
      } else {
        setIsCustomDrivetrain(false);
        setDrivetrainSelect('');
        setCustomDrivetrain('');
      }

      reset({
        name: variant.name,
        variantCode: variant.variantCode || '',
        slug: variant.slug || '',
        brandId:
          variant.model?.brandId?._id ||
          variant.model?.brandId ||
          variant.modelId?.brandId?._id ||
          variant.modelId?.brandId ||
          '',
        modelId: variant.model?._id || variant.modelId?._id || variant.modelId || '',
        generationId: variant.generationId?._id || variant.generationId || '',
        modelYear: variant.modelYear,
        fuelType: variant.fuelType,
        transmissionType: rawTransmission,
        drivetrain: rawDrivetrain,
        engine: variant.engine || {},
        seatingCapacity: variant.seatingCapacity,
        doors: variant.doors,
        description: variant.description || '',
        shortDescription: variant.shortDescription || '',
        status: variant.status
      });
      setIsSlugManuallyEdited(true); // Preserve existing variant's slug when editing
    }
  }, [data, reset]);

  // Automatic default slug generation on create (Model + optional Generation + Variant Name)
  useEffect(() => {
    if (!isEditMode && !isSlugManuallyEdited) {
      const selectedModelObj = modelsData?.data?.find((m: any) => m._id === selectedModel);
      const selectedGenObj = generationsData?.data?.find((g: any) => g._id === selectedGeneration);

      const generatedSlug = buildDefaultSlug(
        selectedModelObj?.slug || selectedModelObj?.name,
        selectedGenObj?.slug || selectedGenObj?.name,
        watchedName
      );
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [
    isEditMode,
    isSlugManuallyEdited,
    selectedModel,
    selectedGeneration,
    watchedName,
    modelsData,
    generationsData,
    setValue,
  ]);

  const clearTemplateDerivedFields = () => {
    setIsCustomTransmission(false);
    setTransmissionSelect('');
    setCustomTransmission('');
    setIsCustomDrivetrain(false);
    setDrivetrainSelect('');
    setCustomDrivetrain('');
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
    source: {
      modelYear?: number;
      fuelType?: string;
      transmissionType?: string;
      drivetrain?: string;
      engine?: BasicInfoData['engine'];
      seatingCapacity?: number;
      doors?: number;
      description?: string;
      shortDescription?: string;
    } | null | undefined,
  ) => {
    if (!source) return;
    // Keep current name / status / variantCode — do not overwrite unique fields
    if (source.modelYear !== undefined) setValue('modelYear', source.modelYear);
    if (source.fuelType) setValue('fuelType', source.fuelType as any);
    if (source.transmissionType) {
      const rawTrans = source.transmissionType;
      const stdTrans = ['manual', 'automatic', 'cvt', 'dct', 'amt'];
      if (stdTrans.includes(rawTrans)) {
        setIsCustomTransmission(false);
        setTransmissionSelect(rawTrans);
        setCustomTransmission('');
      } else {
        setIsCustomTransmission(true);
        setTransmissionSelect('custom');
        setCustomTransmission(rawTrans);
      }
      setValue('transmissionType', rawTrans as any);
    }
    if (source.drivetrain) {
      const rawDrive = source.drivetrain;
      const stdDrive = ['fwd', 'rwd', 'awd', '4wd'];
      if (stdDrive.includes(rawDrive)) {
        setIsCustomDrivetrain(false);
        setDrivetrainSelect(rawDrive);
        setCustomDrivetrain('');
      } else {
        setIsCustomDrivetrain(true);
        setDrivetrainSelect('custom');
        setCustomDrivetrain(rawDrive);
      }
      setValue('drivetrain', rawDrive as any);
    }
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

  const selectTemplateCandidate = (candidate: VariantTemplateCandidate) => {
    clearTemplateDerivedFields();
    applyTemplateToForm(candidate);
    setSourceVariantId(candidate.sourceVariantId);
    setAutoPopulateSeverity('success');
    setAutoPopulateMessage(
      `Using "${candidate.name}"${candidate.modelYear ? ` (${candidate.modelYear})` : ''} as the template. All steps will be pre-filled; you can still edit everything.`,
    );
  };

  // Lookup template when switch is ON and Brand + Model (+ optional Generation) are selected
  useEffect(() => {
    if (!autoPopulate || !isNewVehicle) {
      return;
    }

    if (!selectedBrand || !selectedModel) {
      setSourceVariantId(null);
      setTemplateCandidates([]);
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
      setTemplateCandidates([]);
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
        const candidates = result?.candidates || [];

        if (result?.found && candidates.length > 0) {
          setTemplateCandidates(candidates);

          if (result.requiresSelection && candidates.length > 1) {
            // Multiple matches (common when Generation is empty) — do not guess; let the user pick
            setSourceVariantId(null);
            setAutoPopulateSeverity('info');
            setAutoPopulateMessage(
              result.message ||
                `Found ${candidates.length} existing vehicles for this selection. Choose which one to populate from.`,
            );
          } else {
            const chosen = candidates[0];
            selectTemplateCandidate(chosen);
          }
        } else if (result?.found && result.sourceVariant && result.sourceVariantId) {
          // Backward-compatible fallback if candidates array is missing
          applyTemplateToForm(result.sourceVariant);
          setSourceVariantId(result.sourceVariantId);
          setTemplateCandidates([
            {
              sourceVariantId: result.sourceVariantId,
              name: result.sourceVariant._sourceName || 'Existing vehicle',
              ...result.sourceVariant,
            },
          ]);
          setAutoPopulateSeverity('success');
          setAutoPopulateMessage(
            result.message ||
              `Loaded template from "${result.sourceVariant._sourceName || 'existing vehicle'}". All steps will be pre-filled; you can still edit everything.`,
          );
        } else {
          setSourceVariantId(null);
          setTemplateCandidates([]);
          setAutoPopulateSeverity('warning');
          setAutoPopulateMessage(
            result?.message ||
              'No existing vehicle found for this Brand, Model, and Generation. Continue with manual entry.',
          );
        }
      } catch (err: any) {
        if (cancelled) return;
        setSourceVariantId(null);
        setTemplateCandidates([]);
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

  const onSubmit = async (formData: any) => {
    const submitData = { ...formData };
    
    // Process & validate slug
    let candidateSlug = (submitData.slug || '').trim();
    if (!candidateSlug) {
      const selectedModelObj = modelsData?.data?.find((m: any) => m._id === submitData.modelId);
      const selectedGenObj = generationsData?.data?.find((g: any) => g._id === submitData.generationId);
      candidateSlug = buildDefaultSlug(
        selectedModelObj?.slug || selectedModelObj?.name,
        selectedGenObj?.slug || selectedGenObj?.name,
        submitData.name
      );
    } else {
      candidateSlug = slugify(candidateSlug);
    }

    if (candidateSlug) {
      const checkFn = async (slugToCheck: string) => {
        const res = await getVariantBySlug(slugToCheck);
        if (!res?.data) return null;
        return { _id: res.data._id, slug: res.data.slug };
      };

      const { slug: finalSlug, isModified } = await findUniqueSlug(
        candidateSlug,
        variantId || null,
        checkFn
      );

      submitData.slug = finalSlug;
      setValue('slug', finalSlug);

      if (isModified) {
        setSlugNotice(`Slug "${candidateSlug}" was taken. Assigned unique slug "${finalSlug}".`);
      } else {
        setSlugNotice(null);
      }
    }

    if (submitData.description === '') delete submitData.description;
    if (submitData.shortDescription === '') delete submitData.shortDescription;
    if (submitData.fuelType === '') delete submitData.fuelType;

    if (isCustomTransmission || transmissionSelect === 'custom') {
      const val = customTransmission.trim();
      if (val) submitData.transmissionType = val;
      else delete submitData.transmissionType;
    } else if (transmissionSelect) {
      submitData.transmissionType = transmissionSelect;
    } else {
      delete submitData.transmissionType;
    }

    if (isCustomDrivetrain || drivetrainSelect === 'custom') {
      const val = customDrivetrain.trim();
      if (val) submitData.drivetrain = val;
      else delete submitData.drivetrain;
    } else if (drivetrainSelect) {
      submitData.drivetrain = drivetrainSelect;
    } else {
      delete submitData.drivetrain;
    }
    
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
      setTemplateCandidates([]);
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
      {slugNotice && <Alert severity="info" sx={{ mb: 3 }}>{slugNotice}</Alert>}
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
            <Box sx={{ width: '100%' }}>
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
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 1.5, mb: 1 }}>
                Copies specs, features, colors, markets, and media from an existing vehicle of the same Brand/Model
                {selectedGeneration ? '/Generation' : ''}. If several vehicles match, pick one below — this is separate from the Generation field.
              </Typography>

              {autoPopulate && isLookingUpTemplate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Looking for matching vehicle template...</Typography>
                </Box>
              )}

              {autoPopulateMessage && (
                <Alert severity={autoPopulateSeverity} sx={{ mt: 1, py: 0 }}>
                  {autoPopulateMessage}
                </Alert>
              )}

              {autoPopulate && templateCandidates.length > 1 && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Copy from which existing vehicle? *</InputLabel>
                  <Select
                    label="Copy from which existing vehicle? *"
                    value={sourceVariantId || ''}
                    onChange={(e) => {
                      const chosen = templateCandidates.find((c) => c.sourceVariantId === e.target.value);
                      if (chosen) selectTemplateCandidate(chosen);
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select a vehicle to copy…
                    </MenuItem>
                    {templateCandidates.map((candidate) => (
                      <MenuItem key={candidate.sourceVariantId} value={candidate.sourceVariantId}>
                        {candidate.name}
                        {candidate.modelYear ? ` · ${candidate.modelYear}` : ''}
                        {candidate.variantCode ? ` · ${candidate.variantCode}` : ''}
                        {candidate.fuelType ? ` · ${String(candidate.fuelType).replace(/_/g, ' ')}` : ''}
                        {candidate.status ? ` · ${candidate.status}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Not the Generation field — choose the specific vehicle whose data should be copied.
                  </FormHelperText>
                </FormControl>
              )}
            </Box>
          </Box>
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
                    noOptionsText="No brands found. Click + to add one."
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
                    getOptionLabel={(option: any) => option.name ? `${option.name}${option.status === 'draft' ? ' (Draft)' : ''}` : ''}
                    value={selectedOption}
                    noOptionsText={selectedBrand ? "No models for this brand yet. Click + to add one." : "Select a brand first"}
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

          {(() => {
            const generations = generationsData?.data || [];
            if (!selectedModel) {
              return (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flex: 1 }}>
                  <TextField
                    label="Generation (Optional)"
                    fullWidth
                    disabled
                    helperText="Select a model first"
                  />
                </Box>
              );
            }
            return (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flex: 1 }}>
                <Controller
                  name="generationId"
                  control={control}
                  render={({ field }) => {
                    const selectedOption = generations.find((g: any) => g._id === field.value) || null;
                    return (
                      <Autocomplete
                        options={generations}
                        getOptionLabel={(option: any) => option.name ? `${option.name}${option.status === 'draft' ? ' (Draft)' : ''}` : ''}
                        value={selectedOption}
                        noOptionsText="No generations for this model (optional). Click + to add one."
                        onChange={(_, newValue) => {
                          field.onChange(newValue ? newValue._id : '');
                          lastTemplateKeyRef.current = '';
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Generation (Optional)" 
                            error={!!errors.generationId} 
                            helperText={
                              errors.generationId?.message || 
                              (generations.length === 0
                                ? 'No generations for this model — leave blank or click +'
                                : 'Model generation/year range (optional)')
                            } 
                          />
                        )}
                        sx={{ '& .MuiAutocomplete-listbox': { maxHeight: 250 } }}
                        fullWidth
                        isOptionEqualToValue={(option: any, value: any) => option._id === value._id}
                      />
                    );
                  }}
                />
                <IconButton color="primary" sx={{ mt: 1 }} onClick={() => setGenerationModalOpen(true)}>
                  <AddIcon />
                </IconButton>
              </Box>
            );
          })()}
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
            name="slug"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Slug *"
                fullWidth
                placeholder="e.g. bmw-m3-competition"
                value={field.value || ''}
                onChange={(e) => {
                  setIsSlugManuallyEdited(true);
                  field.onChange(e.target.value);
                }}
                error={!!errors.slug}
                helperText={
                  errors.slug?.message ||
                  (isEditMode
                    ? 'Preserved from existing variant (editable)'
                    : 'Auto-generated from Model + Generation + Variant Name (editable)')
                }
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

          {isCustomTransmission ? (
            <TextField
              label="Transmission"
              fullWidth
              placeholder="Enter custom transmission"
              value={customTransmission}
              onChange={(e) => {
                const val = e.target.value;
                setCustomTransmission(val);
                setValue('transmissionType', val);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCustomTransmission(false);
                          setTransmissionSelect('');
                          setValue('transmissionType', undefined);
                        }}
                        title="Switch to dropdown list"
                      >
                        <ArrowDropDownIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel>Transmission</InputLabel>
              <Select
                label="Transmission"
                value={transmissionSelect}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setIsCustomTransmission(true);
                    setTransmissionSelect('custom');
                  } else {
                    setTransmissionSelect(val);
                    setValue('transmissionType', val);
                  }
                }}
              >
                <MenuItem value="">None</MenuItem>
                {['manual', 'automatic', 'cvt', 'dct', 'amt'].map(v => (
                  <MenuItem key={v} value={v}>{v.toUpperCase()}</MenuItem>
                ))}
                <MenuItem value="custom">CUSTOM</MenuItem>
              </Select>
            </FormControl>
          )}

          {isCustomDrivetrain ? (
            <TextField
              label="Drivetrain"
              fullWidth
              placeholder="Enter custom drivetrain"
              value={customDrivetrain}
              onChange={(e) => {
                const val = e.target.value;
                setCustomDrivetrain(val);
                setValue('drivetrain', val);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCustomDrivetrain(false);
                          setDrivetrainSelect('');
                          setValue('drivetrain', undefined);
                        }}
                        title="Switch to dropdown list"
                      >
                        <ArrowDropDownIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel>Drivetrain</InputLabel>
              <Select
                label="Drivetrain"
                value={drivetrainSelect}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setIsCustomDrivetrain(true);
                    setDrivetrainSelect('custom');
                  } else {
                    setDrivetrainSelect(val);
                    setValue('drivetrain', val);
                  }
                }}
              >
                <MenuItem value="">None</MenuItem>
                {['fwd', 'rwd', 'awd', '4wd'].map(v => (
                  <MenuItem key={v} value={v}>{v.toUpperCase()}</MenuItem>
                ))}
                <MenuItem value="custom">CUSTOM</MenuItem>
              </Select>
            </FormControl>
          )}
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
          onSuccess={(id, brand) => {
            if (brand) {
              queryClient.setQueryData(['brands', 'all'], (old: any) => {
                if (!old?.data) return old;
                return { ...old, data: [...old.data, brand] };
              });
            }
            queryClient.invalidateQueries({ queryKey: ['brands'] });
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
          onSuccess={(id, model) => {
            if (model) {
              queryClient.setQueryData(['models', 'all', selectedBrand], (old: any) => {
                if (!old?.data) return old;
                return { ...old, data: [...old.data, model] };
              });
            }
            queryClient.invalidateQueries({ queryKey: ['models'] });
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
          onSuccess={(id, gen) => {
            if (gen) {
              queryClient.setQueryData(['generations', 'all', selectedModel], (old: any) => {
                if (!old?.data) return old;
                return { ...old, data: [...old.data, gen] };
              });
            }
            queryClient.invalidateQueries({ queryKey: ['generations'] });
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
