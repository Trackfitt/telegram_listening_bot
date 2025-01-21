require('dotenv').config(); // Load environment variables
const express = require('express');
const connectDB = require('./database');

// Create an Express app
const app = express();

// Define a basic route
app.get('/', (req, res) => {
  res.send('Telegram Bot is running!');
});

// Start the HTTP server
const PORT = process.env.PORT || 7006; // Use the provided port or default to 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB and start listening for changes
connectDB();