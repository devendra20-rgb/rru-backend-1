import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Switch, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { customAttributesApi } from '../../api/custom-attributes.api';
import { AdminPageHeader } from '../../components/common/AdminPageHeader';
import { AdminTable, type AdminTableColumn } from '../../components/common/AdminTable';
import { AdminSearchFilter } from '../../components/common/AdminSearchFilter';
import { useToast } from '../../components/common/GlobalToastProvider';

const CustomAttributeList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'sortOrder';
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['custom-attributes', { page, limit, search, sortBy, sortOrder }],
    queryFn: () => customAttributesApi.getAll({ page, limit, search, sortBy, sortOrder })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customAttributesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-attributes'] });
      showToast('Custom attribute deleted successfully', 'success');
      setDeleteId(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error?.message || 'Failed to delete custom attribute. It might be in use.', 'error');
      setDeleteId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      customAttributesApi.update(id, { isActive: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-attributes'] });
      showToast('Status updated', 'success');
    },
    onError: () => {
      showToast('Failed to update status', 'error');
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
    { id: 'name', label: 'Name', sortable: true },
    { id: 'key', label: 'Key', sortable: true },
    { 
      id: 'type', 
      label: 'Type', 
      sortable: true,
      render: (row) => <Chip label={row.type} size="small" variant="outlined" />
    },
    { id: 'unit', label: 'Unit', sortable: false },
    { 
      id: 'isRequired', 
      label: 'Required', 
      sortable: true,
      render: (row) => row.isRequired ? 'Yes' : 'No'
    },
    { id: 'sortOrder', label: 'Order', sortable: true },
    {
      id: 'isActive',
      label: 'Active',
      sortable: true,
      render: (row) => (
        <Switch
          checked={row.isActive}
          onChange={() => toggleStatusMutation.mutate({ id: row._id, status: !row.isActive })}
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
          <IconButton color="primary" onClick={() => navigate(`/custom-attributes/${row._id}/edit`)} size="small">
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
        title="Custom Attributes"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Custom Attributes' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/custom-attributes/new')}>
            Add Attribute
          </Button>
        }
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <AdminSearchFilter 
          value={search}
          onChange={handleSearch}
          placeholder="Search attributes..."
          sx={{ width: 300 }}
        />
      </Box>

      {isError && (
        <Box sx={{ mb: 2, color: 'error.main' }}>Error fetching custom attributes.</Box>
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
        emptyMessage="No custom attributes found."
        emptyAction={
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/custom-attributes/new')}>
            Create your first attribute
          </Button>
        }
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Attribute</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this attribute? If it's used by any vehicles, you must deactivate it instead.
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

export default CustomAttributeList;
