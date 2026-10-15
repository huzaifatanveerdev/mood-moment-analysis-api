require('dotenv').config();
const connectDB = require('./config/database');
const app = require('./app');

// Connect to database
connectDB();

// Start HTTP server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
