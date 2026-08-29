import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AsyncSelect } from '../../components/common/AsyncSelect';
import { getVariants, type Variant } from '../../api/variants.api';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  IconButton,
  Rating
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getReview, createReview, updateReview } from '../../api/reviews.api';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

const reviewSchema = z.object({
  variantId: z.any().nullable().refine((val) => val !== null, { message: 'Variant is required' }),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  pros: z.array(z.object({ value: z.string() })).optional(),
  cons: z.array(z.object({ value: z.string() })).optional()
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const ReviewForm: React.FC = () => {
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
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      variantId: null,
      title: '',
      content: '',
      rating: 5,
      status: 'pending',
      pros: [],
      cons: []
    }
  });

  const { fields: prosFields, append: appendPro, remove: removePro } = useFieldArray({
    control,
    name: "pros"
  });

  const { fields: consFields, append: appendCon, remove: removeCon } = useFieldArray({
    control,
    name: "cons"
  });

  const { data, isLoading: isFetching } = useQuery({
    queryKey: ['review', id],
    queryFn: () => getReview(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const review = data.data;
      reset({
        variantId: review.variantId || null,
        title: review.title,
        content: review.content,
        rating: review.rating,
        status: review.status,
        pros: review.pros ? review.pros.map((p) => ({ value: p })) : [],
        cons: review.cons ? review.cons.map((c) => ({ value: c })) : []
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<import('../../api/reviews.api').Review>) => createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      showToast('Review created successfully', 'success');
      navigate('/reviews');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<import('../../api/reviews.api').Review>) => updateReview(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', id] });
      showToast('Review updated successfully', 'success');
      navigate('/reviews');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const onSubmit = (formData: any) => {
    const submitData: Partial<import('../../api/reviews.api').Review> = {
      variantId: formData.variantId?._id || formData.variantId,
      title: formData.title,
      content: formData.content,
      rating: formData.rating,
      status: formData.status,
      pros: formData.pros?.map((p: { value: string }) => p.value.trim()).filter(Boolean) || [],
      cons: formData.cons?.map((c: { value: string }) => c.value.trim()).filter(Boolean) || []
    };

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/reviews')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Review' : 'Create Review'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="variantId"
              control={control}
              render={({ field }) => (
                <AsyncSelect<Variant>
                  label="Vehicle / Variant"
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  fetchOptions={async (search) => {
                    const response = await getVariants({ search, limit: 20 });
                    return response.data || [];
                  }}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return `${option.name || option.variantCode}`;
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string' || typeof value === 'string') return option === value;
                    return option._id === value._id;
                  }}
                  error={!!errors.variantId}
                  helperText={errors.variantId?.message as string | undefined}
                  placeholder="Search for a vehicle variant..."
                />
              )}
            />

            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />

            <Box>
              <Typography component="legend" color={errors.rating ? 'error' : 'textPrimary'}>
                Rating
              </Typography>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Rating
                    {...field}
                    value={field.value}
                    onChange={(_, newValue) => {
                      field.onChange(newValue || 1);
                    }}
                  />
                )}
              />
              {errors.rating && (
                <FormHelperText error>{errors.rating.message}</FormHelperText>
              )}
            </Box>

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Content"
                  fullWidth
                  multiline
                  rows={6}
                  error={!!errors.content}
                  helperText={errors.content?.message}
                />
              )}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>Pros</Typography>
              <Stack spacing={2}>
                {prosFields.map((field, index) => (
                  <Box key={field.id} sx={{ display: 'flex', gap: 1 }}>
                    <Controller
                      name={`pros.${index}.value`}
                      control={control}
                      render={({ field: inputField }) => (
                        <TextField
                          {...inputField}
                          fullWidth
                          size="small"
                          placeholder="E.g. Very comfortable"
                        />
                      )}
                    />
                    <Button color="error" onClick={() => removePro(index)}>-</Button>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => appendPro({ value: '' })} sx={{ alignSelf: 'flex-start' }}>
                  + Add Pro
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>Cons</Typography>
              <Stack spacing={2}>
                {consFields.map((field, index) => (
                  <Box key={field.id} sx={{ display: 'flex', gap: 1 }}>
                    <Controller
                      name={`cons.${index}.value`}
                      control={control}
                      render={({ field: inputField }) => (
                        <TextField
                          {...inputField}
                          fullWidth
                          size="small"
                          placeholder="E.g. Small rear seats"
                        />
                      )}
                    />
                    <Button color="error" onClick={() => removeCon(index)}>-</Button>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => appendCon({ value: '' })} sx={{ alignSelf: 'flex-start' }}>
                  + Add Con
                </Button>
              </Stack>
            </Box>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="status-label"
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/reviews')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? <CircularProgress size={24} /> : 'Save Review'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ReviewForm;
