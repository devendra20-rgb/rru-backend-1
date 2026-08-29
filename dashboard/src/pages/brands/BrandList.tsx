import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getBrands, deleteBrand, updateBrand } from '../../api/brands.api';
import { AdminPageHeader } from '../../components/common/AdminPageHeader';
import { AdminTable, type AdminTableColumn } from '../../components/common/AdminTable';
import { AdminSearchFilter } from '../../components/common/AdminSearchFilter';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

const BrandList: React.FC = () => {
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['brands', { page, limit, search, sortBy, sortOrder }],
    queryFn: () => getBrands({ page, limit, search, sortBy, sortOrder })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      showToast('Brand deleted successfully', 'success');
      setDeleteId(null);
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateBrand(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      showToast('Brand status updated', 'success');
    },
    onError: (err) => {
      showToast(getReadableErrorMessage(err), 'error');
    }
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

  const handleSearch = (newSearch: string) => {
    updateParams({ search: newSearch, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    updateParams({ limit: newLimit.toString(), page: '1' });
  };

  const handleSortChange = (property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    updateParams({ 
      sortBy: property, 
      sortOrder: isAsc ? 'desc' : 'asc',
      page: '1'
    });
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const columns: AdminTableColumn<any>[] = [
    { id: 'name', label: 'Brand Name', sortable: true },
    { id: 'brandCode', label: 'Code', sortable: true },
    { id: 'slug', label: 'Slug', sortable: true },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Switch
          checked={row.status === 'active'}
          onChange={() => toggleStatusMutation.mutate({ id: row._id, status: row.status === 'active' ? 'inactive' : 'active' })}
          disabled={toggleStatusMutation.isPending}
          size="small"
          color="primary"
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <>
          <IconButton color="primary" onClick={() => navigate(`/brands/${row._id}/edit`)} size="small">
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
        title="Brands"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Brands' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/brands/new')}>
            Add Brand
          </Button>
        }
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <AdminSearchFilter 
          value={search}
          onChange={handleSearch}
          placeholder="Search brands..."
          sx={{ width: 300 }}
        />
      </Box>

      {isError && (
        <Box sx={{ mb: 2, color: 'error.main' }}>{getReadableErrorMessage(error)}</Box>
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
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSortChange={handleSortChange}
        emptyMessage="No brands found."
        emptyAction={
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/brands/new')}>
            Create your first brand
          </Button>
        }
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Brand</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this brand? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrandList;
