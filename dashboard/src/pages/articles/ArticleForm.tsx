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
  Stack,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getArticle, createArticle, updateArticle } from '../../api/articles.api';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.string().optional()
});

type ArticleFormData = z.infer<typeof articleSchema>;

const ArticleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'draft',
      tags: ''
    }
  });

  const { data, isLoading: isFetching } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticle(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (data?.data) {
      const article = data.data;
      reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content || '',
        status: article.status,
        tags: article.tags ? article.tags.join(', ') : ''
      });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<import('../../api/articles.api').Article>) => createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      showToast('Article created successfully', 'success');
      navigate('/articles');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<import('../../api/articles.api').Article>) => updateArticle(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      showToast('Article updated successfully', 'success');
      navigate('/articles');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const onSubmit = (formData: any) => {
    const submitData: Partial<import('../../api/articles.api').Article> = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      status: formData.status,
      tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    };

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value;
    onChange(value);
    if (!isEditMode) {
      setValue('slug', value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''), { shouldValidate: true });
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
        <IconButton onClick={() => navigate('/articles')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Article' : 'Create Article'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
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
                  onChange={(e) => handleTitleChange(e as any, field.onChange)}
                />
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Slug"
                  fullWidth
                  error={!!errors.slug}
                  helperText={errors.slug?.message}
                />
              )}
            />

            <Controller
              name="excerpt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Excerpt"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.excerpt}
                  helperText={errors.excerpt?.message}
                />
              )}
            />

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Content"
                  fullWidth
                  multiline
                  rows={10}
                  error={!!errors.content}
                  helperText={errors.content?.message}
                />
              )}
            />

            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tags (comma separated)"
                  fullWidth
                  error={!!errors.tags}
                  helperText={errors.tags?.message}
                />
              )}
            />

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
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/articles')} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? <CircularProgress size={24} /> : 'Save Article'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ArticleForm;
