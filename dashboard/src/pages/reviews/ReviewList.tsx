import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, CircularProgress,
  Alert, Chip, Stack, FormControl, InputLabel, Select, MenuItem, Rating, Tooltip, Avatar
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import { getReviews, updateReview, deleteReview, type Review } from '../../api/reviews.api';

const STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error' | 'default'; label: string; bg: string; fg: string }> = {
  approved: { color: 'success', label: 'Approved',  bg: '#e8f5e9', fg: '#2e7d32' },
  pending:  { color: 'warning', label: 'Pending',   bg: '#fff8e1', fg: '#f57f17' },
  rejected: { color: 'error',   label: 'Rejected',  bg: '#ffebee', fg: '#c62828' },
  inactive: { color: 'default', label: 'Inactive',  bg: '#eceff1', fg: '#546e7a' },
};

const ReviewList: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reviews', page, rowsPerPage, statusFilter],
    queryFn: async () => {
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      return getReviews(params);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Review['status'] }) => updateReview(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reviews'] }); setDeleteId(null); },
  });

  const reviews: Review[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const total: number = (data as any)?.total ?? reviews.length;

  const getVehicleName = (variantId: Review['variantId']): string => {
    if (!variantId) return '—';
    if (typeof variantId === 'object') {
      return (variantId as any)?.name || (variantId as any)?.variantCode || '—';
    }
    return '—'; // raw ID – backend populate not yet applied
  };

  const getUserName = (userId: Review['userId']): string => {
    if (!userId) return '—';
    if (typeof userId === 'object') {
      return (userId as any)?.username || (userId as any)?.email || '—';
    }
    return '—';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StarIcon sx={{ color: '#E8942B', fontSize: 28 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Reviews</Typography>
          <Chip label={`${total} total`} size="small" sx={{ ml: 1, bgcolor: 'rgba(13,59,73,0.08)', color: '#0D3B49', fontWeight: 600 }} />
        </Box>
        <Stack direction="row" spacing={1}>
          {(['pending', 'approved', 'rejected'] as const).map(s => {
            const count = reviews.filter(r => r.status === s).length;
            return count > 0 ? (
              <Chip key={s} label={`${count} ${s}`} size="small"
                sx={{ bgcolor: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].fg, fontWeight: 600, fontSize: '0.72rem' }} />
            ) : null;
          })}
        </Stack>
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
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching reviews'}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F4F6F7' }}>
                {['Vehicle', 'Reviewer', 'Rating', 'Review', 'Status', 'Date', 'Actions'].map((h, i) => (
                  <TableCell key={h} align={h === 'Actions' ? 'right' : 'left'}
                    sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#66777D',
                      width: ['180px', '120px', '120px', undefined, '110px', '90px', '120px'][i] }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => {
                  const cfg = STATUS_CONFIG[review.status] ?? STATUS_CONFIG.inactive;
                  const vehicleName = getVehicleName(review.variantId);
                  const userName = getUserName(review.userId);
                  return (
                    <TableRow key={review._id}
                      sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(13,59,73,0.02)' } }}>

                      {/* Vehicle */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#0D3B49', fontSize: '0.75rem', fontWeight: 700 }}>
                            {vehicleName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#072830', lineHeight: 1.3 }}>
                            {vehicleName}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Reviewer */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#16313A', fontWeight: 500 }}>{userName}</Typography>
                      </TableCell>

                      {/* Rating */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating value={review.rating} readOnly size="small" precision={1} />
                          <Typography variant="caption" sx={{ color: '#66777D', fontWeight: 600 }}>
                            ({review.rating})
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Review text */}
                      <TableCell sx={{ maxWidth: 340 }}>
                        {review.title && (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#072830', mb: 0.3 }} noWrap>
                            {review.title}
                          </Typography>
                        )}
                        {review.body && (
                          <Typography variant="caption" color="text.secondary"
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {review.body}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip label={cfg.label} size="small"
                          sx={{ bgcolor: cfg.bg, color: cfg.fg, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${cfg.fg}30` }} />
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        {review.status !== 'approved' && (
                          <Tooltip title="Approve">
                            <IconButton size="small" sx={{ color: '#2e7d32' }}
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ id: review._id, status: 'approved' })}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {review.status !== 'rejected' && (
                          <Tooltip title="Reject">
                            <IconButton size="small" sx={{ color: '#f57f17' }}
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ id: review._id, status: 'rejected' })}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(review._id)}>
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>Permanently delete this review? This cannot be undone.</DialogContentText>
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

export default ReviewList;
