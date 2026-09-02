import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Switch,
  TextField,
  InputAdornment,
  Stack,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getCustomAttributes, deleteCustomAttribute, updateCustomAttribute, createCustomAttribute } from '../../api/custom-attributes.api';
import type { CustomAttribute } from '../../api/custom-attributes.api';
import CustomAttributeFormDialog from './CustomAttributeFormDialog';
import { useDebounce } from '../../hooks/useDebounce';

const CustomAttributeList: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<CustomAttribute | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['custom-attributes', page, rowsPerPage, debouncedSearch],
    queryFn: () => {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy: 'sortOrder', sortOrder: 'asc' };
      if (debouncedSearch) params.search = debouncedSearch;
      return getCustomAttributes(params);
    },
    placeholderData: keepPreviousData
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-attributes'] });
      setDeleteId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateCustomAttribute(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-attributes'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<CustomAttribute>) => createCustomAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-attributes'] });
      setFormOpen(false);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to create attribute');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomAttribute> }) => updateCustomAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-attributes'] });
      setFormOpen(false);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to update attribute');
    }
  });

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const handleOpenCreate = () => {
    setEditingAttribute(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (attribute: CustomAttribute) => {
    setEditingAttribute(attribute);
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormSubmit = (formData: Partial<CustomAttribute>) => {
    if (editingAttribute) {
      updateMutation.mutate({ id: editingAttribute._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const attributes = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Custom Attributes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Attribute
        </Button>
      </Box>

      {/* Filter toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search attributes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ minWidth: 260 }}
          />
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching attributes'}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} aria-label="custom attributes table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Applies To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attributes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No custom attributes found.
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attr: CustomAttribute) => (
                  <TableRow key={attr._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">{attr.name}</TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{attr.key}</Typography></TableCell>
                    <TableCell>
                      <Chip label={attr.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{attr.unit || '-'}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{attr.appliesTo}</TableCell>
                    <TableCell>
                      <Switch
                        checked={attr.status === 'active'}
                        onChange={() => handleStatusToggle(attr._id, attr.status)}
                        disabled={toggleStatusMutation.isPending}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(attr)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(attr._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
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
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Attribute</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this custom attribute? This action cannot be undone. Any existing values on vehicles/variants will remain in the database but will no longer be mapped to this attribute definition.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button 
            onClick={() => { if(deleteId) deleteMutation.mutate(deleteId); }} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomAttributeFormDialog 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        initialData={editingAttribute}
        onSubmit={handleFormSubmit}
        isSaving={createMutation.isPending || updateMutation.isPending}
        error={formError}
      />
    </Box>
  );
};

export default CustomAttributeList;
