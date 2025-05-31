// server/index.js

const express = require("express");
const cors = require("cors");
const path = require('path');
const quotesRouter = require('./routes/quotes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  // Allow any origin on port 3000
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Allow any origin that matches our expected pattern
    if(origin.match(/^http:\/\/.*:3000$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - all routes will be prefixed with /api
app.use('/api', quotesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Update the listen call to bind to all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log('For local network access, use your machine\'s IP address');
});
