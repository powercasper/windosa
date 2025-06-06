// server/index.js

const express = require("express");
const cors = require("cors");
const path = require('path');
const quotesRouter = require('./routes/quotes');
const pricingRoutes = require('./routes/pricing');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'your-production-domain.com' // Replace with your actual production domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow both localhost variations in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - all routes will be prefixed with /api
app.use('/api', quotesRouter);
app.use('/api', pricingRoutes);

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
