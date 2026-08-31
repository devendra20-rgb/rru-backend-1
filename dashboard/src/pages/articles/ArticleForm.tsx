import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, CircularProgress, Alert, Stack,
  Typography, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticle, createArticle, updateArticle } from '../../api/articles.api';

const CATEGORIES = ['News', 'Review', 'Guide', 'Comparison', 'Opinion', 'Industry', 'EV', 'Luxury', 'Off-road', 'Other'];

const articleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['published', 'draft', 'archived']).default('draft'),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const ArticleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema) as any,
    defaultValues: { title: '', slug: '', excerpt: '', content: '', category: '', status: 'draft' },
  });

  const { data, isLoading: isFetching } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticle(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (data?.data) {
      const a = data.data;
      reset({ title: a.title, slug: a.slug, excerpt: a.excerpt || '', content: a.content, category: a.category, status: a.status });
    }
  }, [data, reset]);

  const createMutation = useMutation({
    mutationFn: (d: any) => createArticle(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['articles'] }); navigate('/articles'); },
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => updateArticle(id!, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['articles'] }); navigate('/articles'); },
  });

  const onSubmit = (formData: ArticleFormData) => {
    const payload = { ...formData };
    if (!payload.slug) delete payload.slug;
    if (!payload.excerpt) delete payload.excerpt;
    isEditMode ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error || updateMutation.error;

  if (isFetching) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/articles')} sx={{ mr: 2 }}>
          Back to Articles
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Article' : 'New Article'}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {saveError instanceof Error ? saveError.message : 'Failed to save article.'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} label="Title *" fullWidth error={!!errors.title} helperText={errors.title?.message} />
            )} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="slug" control={control} render={({ field }) => (
                <TextField {...field} label="Slug (auto-generated if empty)" fullWidth value={field.value || ''} placeholder="e.g. best-suvs-uae-2025" />
              )} />
              <Controller name="category" control={control} render={({ field }) => (
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category *</InputLabel>
                  <Select {...field} label="Category *">
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                </FormControl>
              )} />
              <Controller name="status" control={control} render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              )} />
            </Box>

            <Controller name="excerpt" control={control} render={({ field }) => (
              <TextField {...field} label="Excerpt / Summary" fullWidth multiline rows={2} value={field.value || ''} placeholder="Short summary shown in listings..." />
            )} />

            <Controller name="content" control={control} render={({ field }) => (
              <TextField {...field} label="Content *" fullWidth multiline rows={12}
                error={!!errors.content} helperText={errors.content?.message}
                placeholder="Write the full article content here..." />
            )} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/articles')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSaving}>
                {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Publish Article'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ArticleForm;
