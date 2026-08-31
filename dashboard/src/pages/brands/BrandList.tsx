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
  Switch,
  Avatar,
  TextField,
  InputAdornment,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getBrands, deleteBrand, updateBrand } from '../../api/brands.api';
import { resolveMediaUrl } from '../../utils/media';

const BrandList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['brands', page, rowsPerPage, search],
    queryFn: () => {
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (search) params.search = search;
      return getBrands(params);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setDeleteId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateBrand(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
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

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error instanceof Error ? error.message : 'Error fetching brands'}
      </Alert>
    );
  }

  const brands = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Brands
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/brands/new')}
        >
          Add Brand
        </Button>
      </Box>

      {/* Filter toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search brands..."
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

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="brands table">
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Brand Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Avatar 
                      src={resolveMediaUrl(typeof brand.logoMediaId === 'object' ? (brand.logoMediaId as any)?.url : undefined) || undefined} 
                      alt={brand.name} 
                      variant="rounded" 
                      sx={{ width: 40, height: 40, bgcolor: 'grey.100', objectFit: 'contain', border: '1px solid #e2e8f0', fontSize: '1rem', fontWeight: 700, color: '#0D3B49' }}
                    >
                      {brand.name?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {brand.name}
                  </TableCell>
                  <TableCell>{brand.brandCode}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell>
                    <Switch
                      checked={brand.status === 'active'}
                      onChange={() => handleStatusToggle(brand._id, brand.status)}
                      disabled={toggleStatusMutation.isPending}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => navigate(`/brands/${brand._id}/edit`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setDeleteId(brand._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
