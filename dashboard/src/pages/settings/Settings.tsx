import React from 'react';
import { Box, Typography, Paper, TextField, Button, Switch, FormControlLabel, Divider } from '@mui/material';
import { AdminPageHeader } from '../../components/common/AdminPageHeader';
import SaveIcon from '@mui/icons-material/Save';
import { useToast } from '../../components/common/GlobalToastProvider';

const Settings: React.FC = () => {
  const { showToast } = useToast();

  const handleSave = () => {
    showToast('Settings saved successfully (Mock)', 'success');
  };

  return (
    <Box>
      <AdminPageHeader 
        title="Site Settings"
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings', path: '/settings' }, { label: 'General' }]}
        action={
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        <Box>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              General Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Site Name" 
                defaultValue="RideRoundUp"
                fullWidth
              />
              <TextField 
                label="Contact Email" 
                defaultValue="admin@rideroundup.com"
                fullWidth
              />
              <TextField 
                label="SEO Description" 
                defaultValue="The ultimate vehicle catalog and review platform."
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Features & Maintenance
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel 
                control={<Switch defaultChecked color="primary" />} 
                label="Enable User Registration" 
              />
              <FormControlLabel 
                control={<Switch defaultChecked color="primary" />} 
                label="Enable Comments on Reviews" 
              />
              <FormControlLabel 
                control={<Switch color="error" />} 
                label="Maintenance Mode (Disables public site)" 
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
