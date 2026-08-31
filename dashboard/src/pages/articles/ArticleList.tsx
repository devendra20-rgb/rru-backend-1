import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  CircularProgress, Alert, Chip, Stack, FormControl, InputLabel, Select, MenuItem,
  Tooltip
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import { getArticles, deleteArticle } from '../../api/articles.api';

const STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'default'; label: string }> = {
  published: { color: 'success', label: 'Published' },
  draft:     { color: 'warning', label: 'Draft' },
  archived:  { color: 'default', label: 'Archived' },
};

/** Convert slug like "buying-guide" → "Buying Guide", "ev" → "EV" */
const formatCategory = (cat: string): string => {
  const overrides: Record<string, string> = { ev: 'EV', uae: 'UAE' };
  return cat
    .split(/[-_]/)
    .map((w) => overrides[w.toLowerCase()] ?? (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
};

const CATEGORY_COLORS: Record<string, string> = {
  news: '#1976d2',
  review: '#7b1fa2',
  guide: '#2e7d32',
  'buying-guide': '#2e7d32',
  comparison: '#e65100',
  opinion: '#c62828',
  industry: '#0288d1',
  ev: '#00695c',
  luxury: '#4a148c',
  'off-road': '#4e342e',
  other: '#546e7a',
};

const ArticleList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['articles', page, rowsPerPage, statusFilter],
    queryFn: () => {
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      return getArticles(params);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setDeleteId(null);
    },
  });

  const articles = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ArticleIcon sx={{ color: '#0D3B49', fontSize: 28 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Articles</Typography>
          <Chip label={`${total} total`} size="small" sx={{ ml: 1, bgcolor: 'rgba(13,59,73,0.08)', color: '#0D3B49', fontWeight: 600 }} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/articles/new')}
          sx={{ bgcolor: '#0D3B49', '&:hover': { bgcolor: '#072830' } }}>
          New Article
        </Button>
      </Box>

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Filter:</Typography>
          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status"
              onChange={(e: SelectChangeEvent) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching articles'}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F4F6F7' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#66777D' }}>
                  Title &amp; Excerpt
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#66777D', width: 140 }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#66777D', width: 110 }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#66777D', width: 120 }}>
                  Published
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#66777D', width: 130 }}>
                  Author
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#66777D', width: 100 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No articles found.
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => {
                  const catKey = article.category?.toLowerCase();
                  const catColor = CATEGORY_COLORS[catKey] ?? '#546e7a';
                  const statusCfg = STATUS_CONFIG[article.status] ?? { color: 'default', label: article.status };
                  return (
                    <TableRow key={article._id}
                      sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(13,59,73,0.02)' } }}>
                      <TableCell sx={{ maxWidth: 400, py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#072830', lineHeight: 1.4 }}>
                          {article.title}
                        </Typography>
                        {article.excerpt && (
                          <Typography variant="caption" color="text.secondary"
                            sx={{ display: 'block', mt: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>
                            {article.excerpt}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatCategory(article.category || '')}
                          size="small"
                          sx={{
                            bgcolor: `${catColor}15`,
                            color: catColor,
                            border: `1px solid ${catColor}40`,
                            fontWeight: 600,
                            fontSize: '0.72rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusCfg.label}
                          size="small"
                          color={statusCfg.color}
                          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#16313A' }}>
                          {typeof article.authorId === 'object'
                            ? (article.authorId as any)?.username || (article.authorId as any)?.email || '—'
                            : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/articles/${article._id}/edit`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(article._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Article</DialogTitle>
        <DialogContent>
          <DialogContentText>Permanently delete this article? This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={() => deleteId && deleteMutation.mutate(deleteId)} color="error" variant="contained"
            disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticleList;
