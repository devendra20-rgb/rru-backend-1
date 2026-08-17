import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import GroupIcon from '@mui/icons-material/Group';

interface DashboardStats {
  totalBrands: number;
  totalModels: number;
  totalGenerations: number;
  totalVariants: number;
  totalUsers: number;
  activeVariants: number;
  draftVariants: number;
  recentlyAddedVariants: number;
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
    <Box sx={{ bgcolor: `${color}.light`, color: `${color}.main`, p: 1.5, borderRadius: '50%', display: 'flex' }}>
      {icon}
    </Box>
  </Paper>
);

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data.data as DashboardStats;
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Failed to load dashboard statistics. {(error as any)?.response?.data?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Welcome to the Ride Round Up Admin Dashboard.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mt: 1 }}>
        <Box>
          <StatCard title="Total Brands" value={stats?.totalBrands || 0} icon={<CategoryIcon />} color="primary" />
        </Box>
        <Box>
          <StatCard title="Total Models" value={stats?.totalModels || 0} icon={<DirectionsCarIcon />} color="success" />
        </Box>
        <Box>
          <StatCard title="Total Generations" value={stats?.totalGenerations || 0} icon={<LayersIcon />} color="warning" />
        </Box>
        <Box>
          <StatCard title="Total Variants/Cars" value={stats?.totalVariants || 0} icon={<DirectionsCarIcon />} color="info" />
        </Box>
        
        <Box>
          <StatCard title="Active Vehicles" value={stats?.activeVariants || 0} icon={<DirectionsCarIcon />} color="success" />
        </Box>
        <Box>
          <StatCard title="Draft Vehicles" value={stats?.draftVariants || 0} icon={<DirectionsCarIcon />} color="warning" />
        </Box>
        <Box>
          <StatCard title="Recently Added" value={stats?.recentlyAddedVariants || 0} icon={<DirectionsCarIcon />} color="secondary" />
        </Box>
        <Box>
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<GroupIcon />} color="error" />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
