import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Box,
  Skeleton,
  Typography,
  Button
} from '@mui/material';

export interface AdminTableColumn<T> {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSortChange?: (property: string) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function AdminTable<T extends { id?: string | number; _id?: string }>({
  columns,
  data,
  loading = false,
  total = 0,
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  emptyMessage = 'No data found',
  emptyAction
}: AdminTableProps<T>) {

  const handleSortRequest = (property: string) => {
    if (onSortChange) {
      onSortChange(property);
    }
  };

  const getRowKey = (row: T, index: number) => {
    return row.id || row._id || `row-${index}`;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: '0 2px 8px rgba(7, 40, 48, 0.06)' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ 
                    bgcolor: '#F4F6F7', 
                    color: '#66777D', 
                    fontWeight: 700, 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  sortDirection={sortBy === column.id ? sortOrder : false}
                >
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortOrder : 'asc'}
                      onClick={() => handleSortRequest(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Skeleton Loading State
              Array.from(new Array(Math.min(rowsPerPage, 5))).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} align={col.align || 'left'}>
                      <Skeleton animation="wave" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {emptyMessage}
                  </Typography>
                  {emptyAction && (
                    <Box sx={{ mt: 2 }}>
                      {emptyAction}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              data.map((row, index) => (
                <TableRow hover key={getRowKey(row, index)} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {column.render ? column.render(row) : (row as any)[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page - 1} // MUI uses 0-based indexing for page
        onPageChange={(e, newPage) => onPageChange(newPage + 1)} // Convert back to 1-based indexing
        onRowsPerPageChange={(e) => {
          onRowsPerPageChange(parseInt(e.target.value, 10));
          onPageChange(1); // Reset to first page
        }}
        sx={{ borderTop: '1px solid #EDF0F1' }}
      />
    </Paper>
  );
}
