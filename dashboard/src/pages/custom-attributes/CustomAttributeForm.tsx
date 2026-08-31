import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { CustomAttributeType } from '../../api/custom-attributes.api';
import { customAttributesApi } from '../../api/custom-attributes.api';
import { AdminPageHeader } from '../../components/common/AdminPageHeader';
import { useToast } from '../../components/common/GlobalToastProvider';

interface FormData {
  name: string;
  key: string;
  type: CustomAttributeType;
  unit?: string;
  description?: string;
  appliesTo: string;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  options: string[];
}

const CustomAttributeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    key: '',
    type: 'text',
    unit: '',
    description: '',
    appliesTo: 'Car',
    isRequired: false,
    isActive: true,
    sortOrder: 0,
    options: []
  });

  const [optionInput, setOptionInput] = useState('');

  const { data: attribute, isLoading } = useQuery({
    queryKey: ['custom-attribute', id],
    queryFn: () => customAttributesApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name,
        key: attribute.key,
        type: attribute.type,
        unit: attribute.unit || '',
        description: attribute.description || '',
        appliesTo: attribute.appliesTo,
        isRequired: attribute.isRequired,
        isActive: attribute.isActive,
        sortOrder: attribute.sortOrder,
        options: attribute.options || []
      });
    }
  }, [attribute]);

  const mutation = useMutation({
    mutationFn: (data: Partial<FormData>) => {
      const payload = { ...data };
      if (payload.type !== 'select') {
        payload.options = [];
      }
      return isEdit ? customAttributesApi.update(id!, payload) : customAttributesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-attributes'] });
      showToast(`Custom attribute ${isEdit ? 'updated' : 'created'} successfully`, 'success');
      navigate('/custom-attributes');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error?.message || `Failed to ${isEdit ? 'update' : 'create'} attribute`, 'error');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
    
    // Auto generate key if not in edit mode and user hasn't modified it manually
    if (name === 'name' && !isEdit) {
      const generatedKey = (value as string).toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      setFormData(prev => ({ ...prev, key: generatedKey }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddOption = () => {
    if (optionInput.trim() && !formData.options.includes(optionInput.trim())) {
      setFormData(prev => ({ ...prev, options: [...prev.options, optionInput.trim()] }));
      setOptionInput('');
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === 'select' && formData.options.length === 0) {
      showToast('Select type must have at least one option', 'error');
      return;
    }
    mutation.mutate(formData);
  };

  if (isLoading) return <Box sx={{ p: 3 }}>Loading...</Box>;

  return (
    <Box>
      <AdminPageHeader 
        title={isEdit ? 'Edit Attribute' : 'New Attribute'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' }, 
          { label: 'Custom Attributes', path: '/custom-attributes' },
          { label: isEdit ? 'Edit' : 'New' }
        ]}
      />

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, bgcolor: 'background.paper', p: 3, borderRadius: 1, boxShadow: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <TextField
              required
              fullWidth
              label="Attribute Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              helperText="e.g. Battery Capacity"
            />
          </Box>
          <Box>
            <TextField
              required
              fullWidth
              label="Key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              disabled={isEdit}
              helperText="Unique identifier (e.g. battery_capacity)"
              slotProps={{ htmlInput: { pattern: '^[a-z0-9_]+$' } }}
            />
          </Box>

          <Box>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange as any}
                label="Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Boolean (Yes/No)</MenuItem>
                <MenuItem value="select">Select (Dropdown)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              helperText="Optional (e.g. kWh, mm, kg)"
              disabled={formData.type === 'boolean' || formData.type === 'select'}
            />
          </Box>

          <Box sx={{ gridColumn: { sm: 'span 2' } }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
              helperText="Internal notes or help text for this attribute"
            />
          </Box>

          {formData.type === 'select' && (
            <Box sx={{ gridColumn: { sm: 'span 2' } }}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Options for Dropdown</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    placeholder="Enter an option..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <Button variant="contained" onClick={handleAddOption} startIcon={<AddIcon />}>Add</Button>
                </Box>
                
                {formData.options.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {formData.options.map((opt, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                        <Typography>{opt}</Typography>
                        <IconButton size="small" color="error" onClick={() => handleRemoveOption(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">At least one option is required for Select type.</Typography>
                )}
              </Box>
            </Box>
          )}

          <Box>
            <TextField
              fullWidth
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={handleChange}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={formData.isRequired} onChange={handleSwitchChange} name="isRequired" />}
              label="Required Field"
            />
            <FormControlLabel
              control={<Switch checked={formData.isActive} onChange={handleSwitchChange} name="isActive" />}
              label="Active"
            />
          </Box>

        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/custom-attributes')}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={mutation.isPending || (formData.type === 'select' && formData.options.length === 0)}
          >
            {mutation.isPending ? 'Saving...' : 'Save Attribute'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomAttributeForm;
