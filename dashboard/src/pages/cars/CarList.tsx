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
  Chip,
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
  Stack
} from '@mui/material';
import { type SelectChangeEvent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getVariants, deleteVariant } from '../../api/variants.api';
import { getBrands } from '../../api/brands.api';
import { getModels } from '../../api/models.api';
import { getGenerations } from '../../api/generations.api';

const CarList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');

  const { data: brandsData } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ limit: 100 })
  });

  const { data: modelsData } = useQuery({
    queryKey: ['models', 'all', selectedBrand],
    queryFn: () => getModels({ limit: 100, brandId: selectedBrand === 'all' ? undefined : selectedBrand }),
    enabled: selectedBrand !== 'all'
  });

  const { data: generationsData } = useQuery({
    queryKey: ['generations', 'all', selectedModel],
    queryFn: () => getGenerations({ limit: 100, modelId: selectedModel === 'all' ? undefined : selectedModel }),
    enabled: selectedModel !== 'all'
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['variants', page, rowsPerPage, selectedGeneration],
    queryFn: () => {
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (selectedGeneration !== 'all') {
        params.generationId = selectedGeneration;
      }
      return getVariants(params);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      setDeleteId(null);
    }
  });

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
    setSelectedGeneration('all');
    setPage(0);
  };

  const handleModelFilterChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
    setSelectedGeneration('all');
    setPage(0);
  };

  const handleGenerationFilterChange = (event: SelectChangeEvent) => {
    setSelectedGeneration(event.target.value);
    setPage(0);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const variants = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Cars / Vehicles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/cars/new')}
        >
          Add Vehicle
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

          <FormControl sx={{ minWidth: 200 }} disabled={selectedModel === 'all'}>
            <InputLabel>Filter by Generation</InputLabel>
            <Select
              value={selectedGeneration}
              label="Filter by Generation"
              onChange={handleGenerationFilterChange}
            >
              <MenuItem value="all">All Generations</MenuItem>
              {generationsData?.data.map((gen) => (
                <MenuItem key={gen._id} value={gen._id}>{gen.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Error fetching vehicles'}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} aria-label="variants table">
            <TableHead>
              <TableRow>
                <TableCell>Variant Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Generation</TableCell>
                <TableCell>Model Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                variants.map((variant) => (
                  <TableRow key={variant._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {variant.name}
                    </TableCell>
                    <TableCell>{variant.variantCode}</TableCell>
                    <TableCell>{variant.generationId?.name || 'Unknown'}</TableCell>
                    <TableCell>{variant.modelYear || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={variant.status} 
                        color={variant.status === 'active' ? 'success' : variant.status === 'draft' ? 'warning' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="info" onClick={() => navigate(`/cars/${variant._id}`)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => navigate(`/cars/${variant._id}/edit`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(variant._id)}>
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vehicle variant? This action cannot be undone.
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

export default CarList;
