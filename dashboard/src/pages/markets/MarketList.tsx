import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
  TextField,
  InputAdornment,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getMarkets, deleteMarket, updateMarket } from '../../api/markets.api';
import { useDebounce } from '../../hooks/useDebounce';

const MarketList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['markets', page, rowsPerPage, debouncedSearch],
    queryFn: () => {
      const params: any = { page: page + 1, limit: rowsPerPage };
      if (debouncedSearch) params.search = debouncedSearch;
      return getMarkets(params);
    },
    placeholderData: keepPreviousData
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMarket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
      setDeleteId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      updateMarket(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] });
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

  const markets = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Markets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/markets/new')}
        >
          Add Market
        </Button>
      </Box>

      {/* Filter toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search markets..."
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
          {error instanceof Error ? error.message : 'Error fetching markets'}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} aria-label="markets table">
            <TableHead>
              <TableRow>
                <TableCell>Market Name</TableCell>
                <TableCell>Country Code</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {markets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No markets found.
                  </TableCell>
                </TableRow>
              ) : (
                markets.map((market) => (
                  <TableRow key={market._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">{market.name}</TableCell>
                    <TableCell>{market.countryCode}</TableCell>
                    <TableCell>
                      {market.currencyCode} {market.currencySymbol ? `(${market.currencySymbol})` : ''}
                    </TableCell>
                    <TableCell>{market.region || '-'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={market.status === 'active'}
                        onChange={() => handleStatusToggle(market._id, market.status)}
                        disabled={toggleStatusMutation.isPending}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => navigate(`/markets/${market._id}/edit`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(market._id)}>
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
        <DialogTitle>Delete Market</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this market? This action cannot be undone and may affect vehicle pricing data.
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

export default MarketList;
