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

const drawerWidth = 260;

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();

  // Collapsible states
  const [openCatalog, setOpenCatalog] = useState(true);
  const [openVehicleData, setOpenVehicleData] = useState(false);
  const [openContent, setOpenContent] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Ride Round Up Admin
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.firstName} ({user.role})
            </Typography>
          )}
          <Button variant="outlined" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard" selected={location.pathname === '/dashboard'}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/file-manager" selected={isActive('/file-manager')}>
                <ListItemIcon><FolderIcon /></ListItemIcon>
                <ListItemText primary="File Manager" />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider />

          <List subheader={<ListSubheader>Catalog</ListSubheader>}>
            <ListItemButton onClick={() => setOpenCatalog(!openCatalog)}>
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Catalog" />
              {openCatalog ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openCatalog} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/brands" selected={isActive('/brands')}>
                  <ListItemText primary="Brands" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/models" selected={isActive('/models')}>
                  <ListItemText primary="Models" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/generations" selected={isActive('/generations')}>
                  <ListItemText primary="Generations" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/cars" selected={isActive('/cars')}>
                  <ListItemText primary="Cars / Vehicles" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>

          <Divider />

          <List subheader={<ListSubheader>Vehicle Data</ListSubheader>}>
            <ListItemButton onClick={() => setOpenVehicleData(!openVehicleData)}>
              <ListItemIcon><MemoryIcon /></ListItemIcon>
              <ListItemText primary="Vehicle Data" />
              {openVehicleData ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openVehicleData} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/features" selected={isActive('/features')}>
                  <ListItemIcon><StarIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Features" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/colors" selected={isActive('/colors')}>
                  <ListItemIcon><PaletteIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Colors" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/markets" selected={isActive('/markets')}>
                  <ListItemIcon><PublicIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Markets" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>

          <Divider />

          <List subheader={<ListSubheader>Content</ListSubheader>}>
            <ListItemButton onClick={() => setOpenContent(!openContent)}>
              <ListItemIcon><ArticleIcon /></ListItemIcon>
              <ListItemText primary="Content" />
              {openContent ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openContent} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/articles" selected={isActive('/articles')}>
                  <ListItemText primary="Articles" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={Link} to="/reviews" selected={isActive('/reviews')}>
                  <ListItemText primary="Reviews" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>

          <Divider />

          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/users" selected={isActive('/users')}>
                <ListItemIcon><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/settings" selected={isActive('/settings')}>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;

