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
import { getGenerations, deleteGeneration, updateGeneration } from '../../api/generations.api';
import { getModels } from '../../api/models.api';
import { AdminPageHeader } from '../../components/common/AdminPageHeader';
import { AdminTable, type AdminTableColumn } from '../../components/common/AdminTable';
import { AdminSearchFilter } from '../../components/common/AdminSearchFilter';
import { AsyncSelect } from '../../components/common/AsyncSelect';
import { useToast } from '../../components/common/GlobalToastProvider';
import { getReadableErrorMessage } from '../../utils/apiError';

const GenerationList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const modelId = searchParams.get('modelId') || '';
  const modelName = searchParams.get('modelName') || '';

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['generations', { page, limit, search, sortBy, sortOrder, modelId }],
    queryFn: () => getGenerations({ page, limit, search, sortBy, sortOrder, modelId: modelId || undefined })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGeneration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      showToast('Generation deleted successfully', 'success');
      setDeleteId(null);
    },
    onError: (err) => showToast(getReadableErrorMessage(err), 'error')
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateGeneration(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      showToast('Generation status updated', 'success');
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
    { id: 'name', label: 'Generation Name', sortable: true },
    { id: 'generationCode', label: 'Code', sortable: true },
    { id: 'modelId', label: 'Model', render: (row) => row.modelId?.name || 'Unknown' },
    { id: 'years', label: 'Years', render: (row) => row.startYear ? `${row.startYear} - ${row.endYear || 'Present'}` : '-' },
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
          <IconButton color="primary" onClick={() => navigate(`/generations/${row._id}/edit`)} size="small">
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
        title="Generations"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Generations' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/generations/new')}>
            Add Generation
          </Button>
        }
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <AdminSearchFilter 
          value={search}
          onChange={(val) => updateParams({ search: val, page: '1' })}
          placeholder="Search generations..."
          sx={{ width: 300 }}
        />
        <Box sx={{ width: 250 }}>
          <AsyncSelect<any>
            label="Filter by Model"
            placeholder="Select Model"
            value={modelId ? { _id: modelId, name: modelName } : null}
            onChange={(val) => {
              updateParams({ 
                modelId: val?._id || '', 
                modelName: val?.name || '',
                page: '1' 
              });
            }}
            fetchOptions={async (q) => {
              const res = await getModels({ search: q, limit: 20 });
              return res.data;
            }}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        </Box>
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
        onPageChange={(p) => updateParams({ page: p.toString() })}
        onRowsPerPageChange={(l) => updateParams({ limit: l.toString(), page: '1' })}
        onSortChange={(property) => {
          const isAsc = sortBy === property && sortOrder === 'asc';
          updateParams({ sortBy: property, sortOrder: isAsc ? 'desc' : 'asc', page: '1' });
        }}
        emptyMessage="No generations found."
        emptyAction={
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/generations/new')}>
            Create your first generation
          </Button>
        }
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Generation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this generation? This action cannot be undone.
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

export default GenerationList;
