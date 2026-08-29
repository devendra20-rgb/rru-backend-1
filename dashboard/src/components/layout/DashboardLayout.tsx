import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Button,
  Collapse,
  ListSubheader,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import PublicIcon from '@mui/icons-material/Public';
import StarIcon from '@mui/icons-material/Star';
import FolderIcon from '@mui/icons-material/Folder';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import MemoryIcon from '@mui/icons-material/Memory';
import LogoutIcon from '@mui/icons-material/Logout';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const drawerWidth = 260;

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();

  // Collapsible states
  const [openCatalog, setOpenCatalog] = useState(true);
  const [openVehicleData, setOpenVehicleData] = useState(true);
  const [openContent, setOpenContent] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const getItemStyle = (path: string) => ({
    borderRadius: '8px',
    mx: 1,
    my: 0.3,
    transition: 'all 150ms ease',
    backgroundColor: isActive(path) ? 'rgba(13, 59, 73, 0.08)' : 'transparent',
    color: isActive(path) ? '#0D3B49' : '#16313A',
    fontWeight: isActive(path) ? 700 : 500,
    borderLeft: isActive(path) ? '3px solid #E8942B' : '3px solid transparent',
    '&:hover': {
      backgroundColor: 'rgba(13, 59, 73, 0.04)',
    },
    '& .MuiListItemIcon-root': {
      color: isActive(path) ? '#0D3B49' : '#66777D',
      minWidth: 38,
    },
    '& .MuiTypography-root': {
      fontSize: '0.86rem',
      fontWeight: isActive(path) ? 700 : 500,
    },
  });

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#FFFFFF',
          color: '#072830',
          borderBottom: '1px solid #DCE3E6',
          boxShadow: '0 1px 4px rgba(7, 40, 48, 0.04)',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                bgcolor: '#0D3B49',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E8942B',
              }}
            >
              <DirectionsCarIcon fontSize="small" />
            </Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              RideRoundUp <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#E8942B', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Admin</span>
            </Typography>
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0D3B49', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                {user.firstName ? user.firstName[0].toUpperCase() : 'A'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#072830', lineHeight: 1.1 }}>
                  {user.firstName} {user.lastName || ''}
                </Typography>
                <Chip
                  label={user.role || 'Admin'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.68rem',
                    bgcolor: 'rgba(232, 148, 43, 0.15)',
                    color: '#C47A1E',
                    fontWeight: 700,
                    mt: 0.3,
                  }}
                />
              </Box>
            </Box>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            startIcon={<LogoutIcon fontSize="small" />}
            sx={{
              borderColor: '#DCE3E6',
              color: '#66777D',
              '&:hover': {
                borderColor: '#C4451D',
                color: '#C4451D',
                backgroundColor: 'rgba(196, 69, 29, 0.04)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderColor: '#DCE3E6',
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />
        <Box sx={{ overflow: 'auto', py: 1.5 }}>
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard" sx={getItemStyle('/dashboard')}>
                <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/file-manager" sx={getItemStyle('/file-manager')}>
                <ListItemIcon><FolderIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="File Manager" />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider sx={{ my: 1.5, borderColor: '#EDF0F1' }} />

          <List
            subheader={
              <ListSubheader sx={{ bgcolor: 'transparent', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#66777D', px: 2.5, py: 0.5, lineHeight: '24px' }}>
                Catalog
              </ListSubheader>
            }
          >
            <ListItemButton onClick={() => setOpenCatalog(!openCatalog)} sx={{ mx: 1, borderRadius: '8px' }}>
              <ListItemIcon sx={{ minWidth: 38, color: '#0D3B49' }}><CategoryIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Catalog" />
              {openCatalog ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
            <Collapse in={openCatalog} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 1 }}>
                <ListItemButton component={Link} to="/brands" sx={getItemStyle('/brands')}>
                  <ListItemText primary="Brands" />
                </ListItemButton>
                <ListItemButton component={Link} to="/models" sx={getItemStyle('/models')}>
                  <ListItemText primary="Models" />
                </ListItemButton>
                <ListItemButton component={Link} to="/generations" sx={getItemStyle('/generations')}>
                  <ListItemText primary="Generations" />
                </ListItemButton>
                <ListItemButton component={Link} to="/cars" sx={getItemStyle('/cars')}>
                  <ListItemText primary="Cars / Vehicles" />
                </ListItemButton>
                <ListItemButton component={Link} to="/custom-attributes" sx={getItemStyle('/custom-attributes')}>
                  <ListItemText primary="Custom Attributes" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>

          <Divider sx={{ my: 1.5, borderColor: '#EDF0F1' }} />

          <List
            subheader={
              <ListSubheader sx={{ bgcolor: 'transparent', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#66777D', px: 2.5, py: 0.5, lineHeight: '24px' }}>
                Vehicle Data
              </ListSubheader>
            }
          >
            <ListItemButton onClick={() => setOpenVehicleData(!openVehicleData)} sx={{ mx: 1, borderRadius: '8px' }}>
              <ListItemIcon sx={{ minWidth: 38, color: '#0D3B49' }}><MemoryIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Vehicle Data" />
              {openVehicleData ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
            <Collapse in={openVehicleData} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 1 }}>
                <ListItemButton component={Link} to="/features" sx={getItemStyle('/features')}>
                  <ListItemIcon sx={{ minWidth: 28 }}><StarIcon sx={{ fontSize: 16 }} /></ListItemIcon>
                  <ListItemText primary="Features" />
                </ListItemButton>
                <ListItemButton component={Link} to="/colors" sx={getItemStyle('/colors')}>
                  <ListItemIcon sx={{ minWidth: 28 }}><PaletteIcon sx={{ fontSize: 16 }} /></ListItemIcon>
                  <ListItemText primary="Colors" />
                </ListItemButton>
                <ListItemButton component={Link} to="/markets" sx={getItemStyle('/markets')}>
                  <ListItemIcon sx={{ minWidth: 28 }}><PublicIcon sx={{ fontSize: 16 }} /></ListItemIcon>
                  <ListItemText primary="Markets" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>

          <Divider sx={{ my: 1.5, borderColor: '#EDF0F1' }} />

          <List
            subheader={
              <ListSubheader sx={{ bgcolor: 'transparent', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#66777D', px: 2.5, py: 0.5, lineHeight: '24px' }}>
                Content & Editorial
              </ListSubheader>
            }
          >
            <ListItemButton onClick={() => setOpenContent(!openContent)} sx={{ mx: 1, borderRadius: '8px' }}>
              <ListItemIcon sx={{ minWidth: 38, color: '#0D3B49' }}><ArticleIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Content" />
              {openContent ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </ListItemButton>
            <Collapse in={openContent} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 1 }}>
                <ListItemButton component={Link} to="/articles" sx={getItemStyle('/articles')}>
                  <ListItemText primary="Articles" />
                </ListItemButton>
                <ListItemButton component={Link} to="/reviews" sx={getItemStyle('/reviews')}>
                  <ListItemText primary="Reviews" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>

          <Divider sx={{ my: 1.5, borderColor: '#EDF0F1' }} />

          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/users" sx={getItemStyle('/users')}>
                <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/settings" sx={getItemStyle('/settings')}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3.5, bgcolor: '#F4F6F7', minHeight: '100vh' }}>
        <Toolbar sx={{ minHeight: 64 }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
