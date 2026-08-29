import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from '../../hooks/useDebounce';

interface AdminSearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sx?: object;
}

export const AdminSearchFilter: React.FC<AdminSearchFilterProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  sx = {}
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    // Only trigger onChange if the debounced value is different from the prop value
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <Box sx={{ ...sx }}>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }
        }}
        sx={{
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          }
        }}
      />
    </Box>
  );
};
