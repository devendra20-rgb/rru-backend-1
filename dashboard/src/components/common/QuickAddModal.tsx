import React from 'react';
import { Dialog, DialogContent, IconButton, DialogTitle, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ open, onClose, title, children }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: 'calc(100% - 64px)',
          m: 4,
          maxHeight: 800
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {/* We add padding to a wrapper Box so the form fits nicely without double padding if the form has its own Paper */}
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'grey.50' }}>
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddModal;
