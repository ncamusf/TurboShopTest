const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Import routes
const catalogRoutes = require('./routes/catalog');
const detailRoutes = require('./routes/detail');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/products', detailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

