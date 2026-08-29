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
  Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getVariants, deleteVariant, updateVariant } from '../../api/variants.api';
import { getBrands } from '../../api/brands.api';
import { getModels } from '../../api/models.api';
import { getGenerations } from '../../api/generations.api';
import { AdminPageHeader } from '../../components/common/AdminPageHeader';
import { AdminTable, type AdminTableColumn } from '../../components/common/AdminTable';
import { AdminSearchFilter } from '../../components/common/AdminSearchFilter';
import { AsyncSelect } from '../../components/common/AsyncSelect';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

const CarList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  
  const brandId = searchParams.get('brandId') || '';
  const brandName = searchParams.get('brandName') || '';
  const modelId = searchParams.get('modelId') || '';
  const modelName = searchParams.get('modelName') || '';
  const generationId = searchParams.get('generationId') || '';
  const generationName = searchParams.get('generationName') || '';

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['variants', { page, limit, search, sortBy, sortOrder, brandId, modelId, generationId }],
    queryFn: () => getVariants({ 
      page, limit, search, sortBy, sortOrder, 
      brandId: brandId || undefined,
      modelId: modelId || undefined,
      generationId: generationId || undefined
    })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      showToast('Vehicle deleted successfully', 'success');
      setDeleteId(null);
    },
    onError: (err) => showToast(getReadableErrorMessage(err), 'error')
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateVariant(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      showToast('Vehicle status updated', 'success');
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

  const columns: AdminTableColumn<any>[] = [
    { id: 'name', label: 'Variant Name', sortable: true },
    { id: 'variantCode', label: 'Code', sortable: true },
    { id: 'generationId', label: 'Generation', render: (row) => row.generationId?.name || 'Unknown' },
    { id: 'modelYear', label: 'Model Year', sortable: true, render: (row) => row.modelYear || '-' },
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
          <IconButton color="info" onClick={() => navigate(`/cars/${row._id}`)} size="small">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton color="primary" onClick={() => navigate(`/cars/${row._id}/edit`)} size="small">
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
        title="Cars / Vehicles"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Cars' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/cars/new')}>
            Add Vehicle
          </Button>
        }
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <AdminSearchFilter 
          value={search}
          onChange={(val) => updateParams({ search: val, page: '1' })}
          placeholder="Search vehicles..."
          sx={{ width: 250 }}
        />
        
        <Box sx={{ width: 200 }}>
          <AsyncSelect<any>
            label="Filter by Brand"
            placeholder="Select Brand"
            value={brandId ? { _id: brandId, name: brandName } : null}
            onChange={(val) => {
              updateParams({ 
                brandId: val?._id || '', 
                brandName: val?.name || '',
                modelId: '', modelName: '', // reset cascade
                generationId: '', generationName: '',
                page: '1' 
              });
            }}
            fetchOptions={async (q) => {
              const res = await getBrands({ search: q, limit: 20 });
              return res.data;
            }}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        </Box>

        <Box sx={{ width: 200 }}>
          <AsyncSelect<any>
            label="Filter by Model"
            placeholder="Select Model"
            disabled={!brandId}
            value={modelId ? { _id: modelId, name: modelName } : null}
            onChange={(val) => {
              updateParams({ 
                modelId: val?._id || '', 
                modelName: val?.name || '',
                generationId: '', generationName: '', // reset cascade
                page: '1' 
              });
            }}
            fetchOptions={async (q) => {
              const res = await getModels({ search: q, brandId: brandId, limit: 20 });
              return res.data;
            }}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        </Box>

        <Box sx={{ width: 200 }}>
          <AsyncSelect<any>
            label="Filter by Generation"
            placeholder="Select Generation"
            disabled={!modelId}
            value={generationId ? { _id: generationId, name: generationName } : null}
            onChange={(val) => {
              updateParams({ 
                generationId: val?._id || '', 
                generationName: val?.name || '',
                page: '1' 
              });
            }}
            fetchOptions={async (q) => {
              const res = await getGenerations({ search: q, modelId: modelId, limit: 20 });
              return res.data;
            }}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        </Box>
      </Box>

      {isError && (
        <Box sx={{ mb: 2, color: 'error.main' }}>Error fetching vehicles.</Box>
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
        emptyMessage="No vehicles found."
        emptyAction={
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/cars/new')}>
            Create your first vehicle
          </Button>
        }
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vehicle variant? This action cannot be undone.
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

export default CarList;
