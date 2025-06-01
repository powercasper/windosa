import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';

const NotesSection = ({ configuration, onUpdate }) => {
  const handleChange = (e) => {
    // Limit to 1000 characters
    if (e.target.value.length <= 1000) {
      onUpdate({ notes: e.target.value });
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CommentIcon /> Notes (Optional)
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Additional Notes"
        value={configuration.notes || ''}
        onChange={handleChange}
        placeholder="Add any special requirements or additional details here (max 1000 characters)..."
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper'
          }
        }}
        helperText={`${(configuration.notes || '').length}/1000 characters`}
      />
    </Box>
  );
};

export default NotesSection; 