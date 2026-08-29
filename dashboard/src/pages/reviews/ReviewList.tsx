import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getReviews, deleteReview } from '../../api/reviews.api';
import { AdminPageHeader } from '../../components/common/AdminPageHeader';
import { AdminTable, type AdminTableColumn } from '../../components/common/AdminTable';
import { AdminSearchFilter } from '../../components/common/AdminSearchFilter';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

const ReviewList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reviews', { page, limit, search, sortBy, sortOrder }],
    queryFn: () => getReviews({ page, limit, search, sortBy, sortOrder })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      showToast('Review deleted successfully', 'success');
      setDeleteId(null);
    },
    onError: (err) => showToast(getReadableErrorMessage(err), 'error')
  });

  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const columns: AdminTableColumn<any>[] = [
    { id: 'title', label: 'Review', sortable: true },
    { 
      id: 'variantId', 
      label: 'Vehicle / Variant', 
      sortable: false, // Nested object sorting is harder
      render: (row) => row.variantId ? `${row.variantId.generationId?.modelId?.brandId?.name || ''} ${row.variantId.generationId?.modelId?.name || ''} ${row.variantId.name || row.variantId.variantCode}`.trim() : 'Unknown'
    },
    { id: 'rating', label: 'Rating', sortable: true },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => (
        <Chip 
          label={row.status} 
          size="small" 
          color={getStatusColor(row.status)} 
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    { 
      id: 'createdAt', 
      label: 'Created', 
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <>
          <IconButton color="primary" onClick={() => navigate(`/reviews/${row._id}/edit`)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" onClick={() => setDeleteId(row._id)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box>
      <AdminPageHeader 
        title="Reviews"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Content' }, { label: 'Reviews' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/reviews/new')}>
            Add Review
          </Button>
        }
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <AdminSearchFilter 
          value={search}
          onChange={(val) => updateParams({ search: val, page: '1' })}
          placeholder="Search reviews..."
          sx={{ width: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={searchParams.get('status') || ''}
            label="Status"
            onChange={(e) => updateParams({ status: e.target.value as string, page: '1' })}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isError && (
        <Box sx={{ mb: 2, color: 'error.main' }}>
          {getReadableErrorMessage(new Error('Failed to fetch reviews'))}
        </Box>
      )}

      <AdminTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        total={data?.meta?.total || 0}
        page={page}
        rowsPerPage={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={(p) => updateParams({ page: p.toString() })}
        onRowsPerPageChange={(l) => updateParams({ limit: l.toString(), page: '1' })}
        onSortChange={(property) => {
          const isAsc = sortBy === property && sortOrder === 'asc';
          updateParams({ sortBy: property, sortOrder: isAsc ? 'desc' : 'asc', page: '1' });
        }}
        emptyMessage="No reviews found."
        emptyAction={
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/reviews/new')}>
            Create your first review
          </Button>
        }
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewList;
