import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useDebounce } from '../../hooks/useDebounce';

interface AsyncSelectProps<T> {
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
  fetchOptions: (search: string) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue: (option: T, value: T) => boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  noOptionsText?: string;
}

export function AsyncSelect<T>({
  label,
  value,
  onChange,
  fetchOptions,
  getOptionLabel,
  isOptionEqualToValue,
  disabled = false,
  error = false,
  helperText,
  placeholder,
  noOptionsText = "No options found"
}: AsyncSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const debouncedSearch = useDebounce(inputValue, 400);

  useEffect(() => {
    let active = true;

    if (!open) {
      return undefined;
    }

    (async () => {
      setLoading(true);
      try {
        const results = await fetchOptions(debouncedSearch);
        if (active) {
          setOptions(results);
        }
      } catch (err) {
        console.error("Error fetching options:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [debouncedSearch, open, fetchOptions]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      id={`async-select-${label.replace(/\s+/g, '-').toLowerCase()}`}
      sx={{ width: '100%' }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel}
      options={options}
      loading={loading}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      disabled={disabled}
      noOptionsText={noOptionsText}
      renderInput={(params) => {
        const { InputProps, ...restParams } = params;
        return (
          <TextField
            {...restParams}
            label={label}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            size="medium" // Keeping consistency with forms usually using medium
            InputProps={{
              ...InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {InputProps?.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        );
      }}
    />
  );
}
