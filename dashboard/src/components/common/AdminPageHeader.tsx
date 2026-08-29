import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminPageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, breadcrumbs, action }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 1 }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast || !crumb.path ? (
                <Typography key={index} color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {crumb.label}
                </Typography>
              ) : (
                <MuiLink 
                  component={Link} 
                  to={crumb.path} 
                  key={index} 
                  color="inherit" 
                  underline="hover"
                  sx={{ fontSize: '0.85rem', color: '#66777D' }}
                >
                  {crumb.label}
                </MuiLink>
              );
            })}
          </Breadcrumbs>
        )}
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#072830', letterSpacing: '-0.5px' }}>
          {title}
        </Typography>
      </Box>
      
      {action && (
        <Box sx={{ mt: { xs: 2, sm: 0 } }}>
          {action}
        </Box>
      )}
    </Box>
  );
};
