import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon      from '@mui/icons-material/Category';
import LayersIcon        from '@mui/icons-material/Layers';
import GroupIcon         from '@mui/icons-material/Group';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import EditNoteIcon      from '@mui/icons-material/EditNote';
import AddCircleIcon     from '@mui/icons-material/AddCircle';

interface DashboardStats {
  totalBrands:           number;
  totalModels:           number;
  totalGenerations:      number;
  totalVariants:         number;
  totalUsers:            number;
  activeVariants:        number;
  draftVariants:         number;
  recentlyAddedVariants: number;
}

// ─── Gradient definitions ────────────────────────────────────────────────────
const GRADIENTS: Record<string, string> = {
  teal:   'linear-gradient(135deg, #0D3B49 0%, #1A6A82 100%)',
  green:  'linear-gradient(135deg, #12805C 0%, #1AAD7A 100%)',
  amber:  'linear-gradient(135deg, #C47A1E 0%, #E8942B 100%)',
  blue:   'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
  violet: 'linear-gradient(135deg, #5E35B1 0%, #7E57C2 100%)',
  red:    'linear-gradient(135deg, #C4451D 0%, #E05A36 100%)',
};

interface StatCardProps {
  title:    string;
  value:    number | string;
  icon:     React.ReactNode;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      sx={{
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 220ms cubic-bezier(0.4,0,0.2,1), box-shadow 220ms cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          transform:  'translateY(-5px)',
          boxShadow:  isDark
            ? '0 12px 32px rgba(0,0,0,0.5)'
            : '0 12px 32px rgba(7,40,48,0.14)',
        },
        // Subtle gradient top-border accent
        '&::before': {
          content:  '""',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height:   '3px',
          background: gradient,
          borderRadius: '12px 12px 0 0',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.text.secondary, mb: 0.5, fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, lineHeight: 1, color: theme.palette.text.primary }}
          >
            {value}
          </Typography>
        </Box>

        {/* Gradient icon bubble */}
        <Box
          sx={{
            width:         52,
            height:        52,
            borderRadius:  '14px',
            background:    gradient,
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            color:         '#FFFFFF',
            flexShrink:    0,
            boxShadow:     `0 4px 14px rgba(0,0,0,0.22)`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn:  async () => {
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
        Failed to load dashboard statistics.{' '}
        {(error as any)?.response?.data?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      {/* ── Welcome banner ─────────────────────────────────────────────────── */}
      <Paper
        sx={{
          p: 3,
          mb: 3.5,
          background: isDark
            ? 'linear-gradient(135deg, #162530 0%, #1E3545 100%)'
            : 'linear-gradient(135deg, #0D3B49 0%, #1A6A82 100%)',
          border: 'none',
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(13,59,73,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}
          >
            Overview
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Welcome to the Ride Round Up Admin Dashboard.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Active',  value: stats?.activeVariants  ?? 0, icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
            { label: 'Drafts',  value: stats?.draftVariants   ?? 0, icon: <EditNoteIcon    sx={{ fontSize: 14 }} /> },
            { label: 'Recent',  value: stats?.recentlyAddedVariants ?? 0, icon: <AddCircleIcon sx={{ fontSize: 14 }} /> },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                px: 2, py: 1,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                color: '#FFFFFF',
              }}
            >
              {item.icon}
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                {item.value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── Stat cards grid ────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        <StatCard
          title="Total Brands"
          value={stats?.totalBrands || 0}
          icon={<CategoryIcon />}
          gradient={GRADIENTS.teal}
        />
        <StatCard
          title="Total Models"
          value={stats?.totalModels || 0}
          icon={<DirectionsCarIcon />}
          gradient={GRADIENTS.green}
        />
        <StatCard
          title="Total Generations"
          value={stats?.totalGenerations || 0}
          icon={<LayersIcon />}
          gradient={GRADIENTS.amber}
        />
        <StatCard
          title="Total Variants / Cars"
          value={stats?.totalVariants || 0}
          icon={<DirectionsCarIcon />}
          gradient={GRADIENTS.blue}
        />
        <StatCard
          title="Active Vehicles"
          value={stats?.activeVariants || 0}
          icon={<CheckCircleIcon />}
          gradient={GRADIENTS.green}
        />
        <StatCard
          title="Draft Vehicles"
          value={stats?.draftVariants || 0}
          icon={<EditNoteIcon />}
          gradient={GRADIENTS.amber}
        />
        <StatCard
          title="Recently Added"
          value={stats?.recentlyAddedVariants || 0}
          icon={<AddCircleIcon />}
          gradient={GRADIENTS.violet}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<GroupIcon />}
          gradient={GRADIENTS.red}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
