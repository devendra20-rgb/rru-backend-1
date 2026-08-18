import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getModels, deleteModel, updateModel } from '../../api/models.api';
import { getBrands } from '../../api/brands.api';

const ModelList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ limit: 100 })
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['models', page, rowsPerPage, selectedBrand],
    queryFn: () => {
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (selectedBrand !== 'all') {
        params.brandId = selectedBrand;
      }
      return getModels(params);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setDeleteId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateModel(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    }
  });

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBrandFilterChange = (event: SelectChangeEvent) => {
    setSelectedBrand(event.target.value);
    setPage(0);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const models = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Models
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/models/new')}
        >
          Add Model
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Brand</InputLabel>
          <Select
            value={selectedBrand}
            label="Filter by Brand"
            onChange={handleBrandFilterChange}
          >
            <MenuItem value="all">All Brands</MenuItem>
            {brandsData?.data.map((brand) => (
              <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching models'}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} aria-label="models table">
            <TableHead>
              <TableRow>
                <TableCell>Model Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Body Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No models found.
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow key={model._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {model.name}
                    </TableCell>
                    <TableCell>{model.modelCode}</TableCell>
                    <TableCell>{model.brandId?.name || 'Unknown'}</TableCell>
                    <TableCell>{model.bodyType || '-'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={model.status === 'active'}
                        onChange={() => handleStatusToggle(model._id, model.status)}
                        disabled={toggleStatusMutation.isPending}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => navigate(`/models/${model._id}/edit`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(model._id)}>
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Model</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this model? This action cannot be undone.
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

export default ModelList;
