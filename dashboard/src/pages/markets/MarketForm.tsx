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
import { getMarket, createMarket, updateMarket } from '../../api/markets.api';

const MARKET_PRESETS = {
  India: { name: 'India', code: 'IN', countryCode: 'IN', currencyCode: 'INR', currencySymbol: '₹' },
  Dubai: { name: 'Dubai', code: 'DXB', countryCode: 'AE', currencyCode: 'AED', currencySymbol: 'د.إ' },
  UAE: { name: 'UAE', code: 'AE', countryCode: 'AE', currencyCode: 'AED', currencySymbol: 'د.إ' },
} as const;

// Validation Schema
const marketSchema = z.object({
  name: z.enum(['India', 'Dubai', 'UAE']),
  code: z.string().min(1, 'Code is required'),
  countryCode: z.string().min(1, 'Country Code is required').max(2, 'Max 2 characters'),
  currencyCode: z.string().min(1, 'Currency Code is required').max(3, 'Max 3 characters'),
  currencySymbol: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type MarketFormData = z.infer<typeof marketSchema>;

const MarketForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<MarketFormData>({
    resolver: zodResolver(marketSchema) as any,
    defaultValues: {
      name: undefined,
      code: '',
      countryCode: '',
      currencyCode: '',
      currencySymbol: '',
      region: '',
      status: 'active'
    }
  });

  const { data, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ['market', id],
    queryFn: () => getMarket(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const market = data.data;
      reset({
        name: market.name as any,
        code: market.code || '',
        countryCode: market.countryCode,
        currencyCode: market.currencyCode || '',
        currencySymbol: market.currencySymbol || '',
        region: market.region || '',
        status: market.status,
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (data: MarketFormData) => createMarket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      navigate('/markets');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: MarketFormData) => updateMarket(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      queryClient.invalidateQueries({ queryKey: ['market', id] });
      navigate('/markets');
    }
  });

  const onSubmit = (formData: MarketFormData) => {
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

  const regions = [
    'North America', 'South America', 'Europe', 'Middle East', 'Africa', 'Asia Pacific', 'Global'
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/markets')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Market' : 'Add Market'}
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching market details'}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError instanceof Error ? saveError.message : 'Error saving market'}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.name}>
                    <InputLabel>Market Name *</InputLabel>
                    <Select 
                      {...field} 
                      label="Market Name *"
                      onChange={(e) => {
                        field.onChange(e);
                        const preset = MARKET_PRESETS[e.target.value as keyof typeof MARKET_PRESETS];
                        if (preset) {
                          setValue('code', preset.code, { shouldValidate: true });
                          setValue('countryCode', preset.countryCode, { shouldValidate: true });
                          setValue('currencyCode', preset.currencyCode, { shouldValidate: true });
                          setValue('currencySymbol', preset.currencySymbol, { shouldValidate: true });
                        }
                      }}
                    >
                      <MenuItem value="India">India</MenuItem>
                      <MenuItem value="Dubai">Dubai</MenuItem>
                      <MenuItem value="UAE">UAE</MenuItem>
                    </Select>
                    {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Code *"
                    fullWidth
                    disabled
                    error={!!errors.code}
                    helperText={errors.code?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Country Code *"
                    fullWidth
                    disabled
                    error={!!errors.countryCode}
                    helperText={errors.countryCode?.message}
                  />
                )}
              />
              
              <Controller
                name="currencyCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Currency Code *"
                    fullWidth
                    disabled
                    error={!!errors.currencyCode}
                    helperText={errors.currencyCode?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="currencySymbol"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Currency Symbol"
                    fullWidth
                    disabled
                    error={!!errors.currencySymbol}
                    helperText={errors.currencySymbol?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.region}>
                    <InputLabel>Region</InputLabel>
                    <Select {...field} label="Region">
                      <MenuItem value="">None</MenuItem>
                      {regions.map((reg) => (
                        <MenuItem key={reg} value={reg}>{reg}</MenuItem>
                      ))}
                    </Select>
                    {errors.region && <FormHelperText>{errors.region.message}</FormHelperText>}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/markets')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Market'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default MarketForm;
