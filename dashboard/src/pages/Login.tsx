import React from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Navigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { isAuthenticated, setUser } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.data.accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${data.data.accessToken}`;
      setUser(data.data.user);
      navigate('/');
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F7', p: 2 }}>
      <Paper elevation={0} sx={{ p: 4.5, width: '100%', maxWidth: 420, border: '1px solid #DCE3E6', borderRadius: '16px', boxShadow: '0 4px 20px rgba(7, 40, 48, 0.06)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#0D3B49',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E8942B',
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(13, 59, 73, 0.2)',
            }}
          >
            <Typography sx={{ fontSize: '1.4rem' }}>🚗</Typography>
          </Box>
          <Typography variant="h5" component="h1" align="center" sx={{ fontWeight: 800, color: '#072830', letterSpacing: '-0.5px' }}>
            RideRoundUp Admin
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: '#66777D', mt: 0.5 }}>
            Sign in to manage catalog, vehicles & content
          </Typography>
        </Box>
        
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }}>
            {(mutation.error as any).response?.data?.message || 'Login failed. Please verify your credentials.'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={mutation.isPending}
            sx={{
              mt: 3,
              mb: 1.5,
              py: 1.3,
              fontWeight: 700,
              bgcolor: '#0D3B49',
              '&:hover': {
                bgcolor: '#072830',
              },
            }}
          >
            {mutation.isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
