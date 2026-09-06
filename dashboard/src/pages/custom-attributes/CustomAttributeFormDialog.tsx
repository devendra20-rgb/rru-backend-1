import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import type { CustomAttribute } from '../../api/custom-attributes.api';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  key: z.string().min(1, 'Key is required').regex(/^[a-z0-9_]+$/, 'Must be lowercase with underscores'),
  type: z.enum(['text', 'number', 'boolean', 'select', 'multi-select']),
  unit: z.string().optional(),
  description: z.string().optional(),
  appliesTo: z.enum(['vehicle', 'variant', 'all']),
  isRequired: z.boolean(),
  status: z.enum(['active', 'inactive']),
  sortOrder: z.number().int(),
  options: z.array(z.string()).optional()
}).refine(data => {
  if ((data.type === 'select' || data.type === 'multi-select') && (!data.options || data.options.length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Options are required for select and multi-select types',
  path: ['options']
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CustomAttribute>) => void;
  initialData?: CustomAttribute | null;
  isSaving: boolean;
  error?: string | null;
}

const slugifyKey = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const CustomAttributeFormDialog: React.FC<Props> = ({ open, onClose, onSubmit, initialData, isSaving, error }) => {
  const [optionInput, setOptionInput] = useState('');
  const [isKeyCustomized, setIsKeyCustomized] = useState(false);
  
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      key: '',
      type: 'text',
      unit: '',
      description: '',
      appliesTo: 'variant',
      isRequired: false,
      status: 'active',
      sortOrder: 0,
      options: []
    }
  });

  const selectedType = watch('type');
  const currentOptions = watch('options') || [];

  useEffect(() => {
    if (open) {
      setIsKeyCustomized(!!initialData);
      if (initialData) {
        reset({
          name: initialData.name,
          key: initialData.key,
          type: initialData.type,
          unit: initialData.unit || '',
          description: initialData.description || '',
          appliesTo: initialData.appliesTo,
          isRequired: initialData.isRequired,
          status: initialData.status,
          sortOrder: initialData.sortOrder || 0,
          options: initialData.options || []
        });
      } else {
        reset({
          name: '',
          key: '',
          type: 'text',
          unit: '',
          description: '',
          appliesTo: 'variant',
          isRequired: false,
          status: 'active',
          sortOrder: 0,
          options: []
        });
      }
      setOptionInput('');
    }
  }, [open, initialData, reset]);

  const handleAddOption = () => {
    if (optionInput.trim() && !currentOptions.includes(optionInput.trim())) {
      setValue('options', [...currentOptions, optionInput.trim()]);
      setOptionInput('');
    }
  };

  const handleRemoveOption = (opt: string) => {
    setValue('options', currentOptions.filter(o => o !== opt));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Custom Attribute' : 'New Custom Attribute'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2.5}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  label="Name (e.g. Battery Capacity)" 
                  fullWidth 
                  error={!!errors.name} 
                  helperText={errors.name?.message} 
                  onChange={(e) => {
                    field.onChange(e);
                    if (!initialData && !isKeyCustomized) {
                      setValue('key', slugifyKey(e.target.value), { shouldValidate: true });
                    }
                  }}
                />
              )}
            />
            
            <Controller
              name="key"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  label="Key (e.g. battery_capacity)" 
                  fullWidth 
                  disabled={!!initialData} 
                  error={!!errors.key} 
                  helperText={errors.key?.message || (initialData ? "Key cannot be changed after creation" : "Auto-generated from Name")} 
                  onChange={(e) => {
                    setIsKeyCustomized(true);
                    field.onChange(e);
                  }}
                />
              )}
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                      <MenuItem value="select">Select (Dropdown)</MenuItem>
                      <MenuItem value="multi-select">Multi-Select</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Unit (e.g. kWh, mm)" fullWidth />
                )}
              />
            </Box>

            {(selectedType === 'select' || selectedType === 'multi-select') && (
              <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" gutterBottom>Options List *</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField 
                    size="small" 
                    label="Add Option" 
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    fullWidth
                  />
                  <Button variant="outlined" onClick={handleAddOption}>Add</Button>
                </Box>
                {errors.options && <Typography color="error" variant="caption">{errors.options.message}</Typography>}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentOptions.map((opt) => (
                    <Chip key={opt} label={opt} onDelete={() => handleRemoveOption(opt)} />
                  ))}
                  {currentOptions.length === 0 && <Typography variant="body2" color="text.secondary">No options added yet.</Typography>}
                </Box>
              </Box>
            )}

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Description (Optional)" multiline rows={2} fullWidth />
              )}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="appliesTo"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Applies To</InputLabel>
                    <Select {...field} label="Applies To">
                      <MenuItem value="variant">Variant Only</MenuItem>
                      <MenuItem value="vehicle">Vehicle Only</MenuItem>
                      <MenuItem value="all">Vehicle & Variant</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              
              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Sort Order" type="number" fullWidth onChange={(e) => field.onChange(Number(e.target.value))} />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 4 }}>
              <Controller
                name="isRequired"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Required" />
                )}
              />
              
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value === 'active'} onChange={(e) => field.onChange(e.target.checked ? 'active' : 'inactive')} color="primary" />} label="Active" />
                )}
              />
            </Box>
            
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Attribute'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CustomAttributeFormDialog;
