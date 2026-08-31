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
  Stack,
  Switch
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getGenerations, deleteGeneration, updateGeneration } from '../../api/generations.api';
import { getBrands } from '../../api/brands.api';
import { getModels } from '../../api/models.api';

const GenerationList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');

  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ limit: 100 })
  });

  const { data: modelsData } = useQuery({
    queryKey: ['models', 'all', selectedBrand],
    queryFn: () => getModels({ limit: 100, brandId: selectedBrand === 'all' ? undefined : selectedBrand }),
    enabled: selectedBrand !== 'all'
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['generations', page, rowsPerPage, selectedBrand, selectedModel],
    queryFn: () => {
      const params: any = { page: page + 1, limit: rowsPerPage };
      // Hierarchical filtering: most specific filter wins
      if (selectedModel !== 'all') {
        params.modelId = selectedModel;
      } else if (selectedBrand !== 'all') {
        params.brandId = selectedBrand;
      }
      return getGenerations(params);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGeneration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      setDeleteId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateGeneration(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
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
    setSelectedModel('all');
    setPage(0);
  };

  const handleModelFilterChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
    setPage(0);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const generations = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Generations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/generations/new')}
        >
          Add Generation
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
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

          <FormControl sx={{ minWidth: 200 }} disabled={selectedBrand === 'all'}>
            <InputLabel>Filter by Model</InputLabel>
            <Select
              value={selectedModel}
              label="Filter by Model"
              onChange={handleModelFilterChange}
            >
              <MenuItem value="all">All Models</MenuItem>
              {modelsData?.data.map((model) => (
                <MenuItem key={model._id} value={model._id}>{model.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching generations'}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} aria-label="generations table">
            <TableHead>
              <TableRow>
                <TableCell>Generation Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Years</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {generations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No generations found.
                  </TableCell>
                </TableRow>
              ) : (
                generations.map((gen) => (
                  <TableRow key={gen._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {gen.name}
                    </TableCell>
                    <TableCell>{gen.generationCode}</TableCell>
                    <TableCell>{gen.modelId?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {gen.startYear ? `${gen.startYear} - ${gen.endYear || 'Present'}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={gen.status === 'active'}
                        onChange={() => handleStatusToggle(gen._id, gen.status)}
                        disabled={toggleStatusMutation.isPending}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => navigate(`/generations/${gen._id}/edit`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(gen._id)}>
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
        <DialogTitle>Delete Generation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this generation? This action cannot be undone.
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

export default GenerationList;
