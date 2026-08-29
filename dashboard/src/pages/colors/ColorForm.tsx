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
import { getColor, createColor, updateColor } from '../../api/colors.api';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

// Validation Schema
const hexCodeRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const colorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  colorCode: z.string().min(1, 'Color Code is required'),
  hexCode: z.string().regex(hexCodeRegex, 'Must be a valid hex color (e.g. #FF0000 or #F00)'),
  colorFamily: z.string().optional(),
  finishType: z.enum(['solid', 'metallic', 'matte', 'pearlescent', '']).optional(),
  type: z.enum(['exterior', 'interior']),
  status: z.enum(['active', 'inactive']).default('active'),
});

type ColorFormData = z.infer<typeof colorSchema>;

const ColorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema) as any,
    defaultValues: {
      name: '',
      colorCode: '',
      hexCode: '',
      colorFamily: '',
      finishType: 'solid',
      type: 'exterior',
      status: 'active'
    }
  });

  const { data, isLoading: isFetching, isError, error } = useQuery({
    queryKey: ['color', id],
    queryFn: () => getColor(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const color = data.data;
      reset({
        name: color.name,
        colorCode: color.colorCode || '',
        hexCode: color.hexCode || '',
        colorFamily: color.colorFamily || '',
        finishType: color.finishType || 'solid',
        type: color.type || 'exterior',
        status: color.status,
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) => createColor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      showToast('Color created successfully', 'success');
      navigate('/colors');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateColor(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      queryClient.invalidateQueries({ queryKey: ['color', id] });
      showToast('Color updated successfully', 'success');
      navigate('/colors');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const onSubmit = async (data: ColorFormData) => {
    const submitData = {
      ...data,
      finishType: data.finishType === '' ? undefined : data.finishType,
      colorFamily: data.colorFamily === '' ? undefined : data.colorFamily
    } as any;
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync(submitData);
    } else {
      await createMutation.mutateAsync(submitData);
    }
  };

  const onFormError = () => {
    showToast('Please fix the highlighted fields before saving.', 'error');
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

  const colorFamilies = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Other'
  ];

  const colorTypes = [
    { value: 'exterior', label: 'Exterior' },
    { value: 'interior', label: 'Interior' }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/colors')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Color' : 'Add Color'}
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getReadableErrorMessage(error)}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit, onFormError)}>
          <Stack spacing={3}>
            
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Color Name *"
                  fullWidth
                  placeholder="e.g. Alpine White"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="colorCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Manufacturer Color Code *"
                    fullWidth
                    placeholder="e.g. 300"
                    error={!!errors.colorCode}
                    helperText={errors.colorCode?.message}
                  />
                )}
              />

              <Controller
                name="hexCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hex Code *"
                    fullWidth
                    placeholder="e.g. #FFFFFF"
                    error={!!errors.hexCode}
                    helperText={errors.hexCode?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="colorFamily"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.colorFamily}>
                    <InputLabel>Color Family</InputLabel>
                    <Select {...field} label="Color Family">
                      <MenuItem value="">None</MenuItem>
                      {colorFamilies.map((fam) => (
                        <MenuItem key={fam} value={fam}>{fam}</MenuItem>
                      ))}
                    </Select>
                    {errors.colorFamily && <FormHelperText>{errors.colorFamily.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="finishType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.finishType}>
                    <InputLabel>Finish Type</InputLabel>
                    <Select {...field} label="Finish Type">
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="solid">Solid</MenuItem>
                      <MenuItem value="metallic">Metallic</MenuItem>
                      <MenuItem value="matte">Matte</MenuItem>
                      <MenuItem value="pearlescent">Pearlescent</MenuItem>
                    </Select>
                    {errors.finishType && <FormHelperText>{errors.finishType.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Type *</InputLabel>
                    <Select {...field} label="Type *">
                      {colorTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                    {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl sx={{ width: '50%' }} error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/colors')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Color'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ColorForm;
