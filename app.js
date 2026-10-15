const express = require('express');
const cors = require('cors');
const languageMiddleware = require('./middleware/languageMiddleware');
const errorHandler = require('./middleware/errorHandler');
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const moodRoutes = require('./routes/moodRoutes');
const companionRoutes = require('./routes/companionRoutes');
const userMoodRoutes = require('./routes/userMoodRoutes');
const freeChatRoutes = require('./routes/freeChatRoutes');
const moodScaleChatRoutes = require('./routes/moodScaleChatRoutes');

const app = express();

// Middleware
app.use(express.json());

// Language detection middleware (must be before routes)
app.use(languageMiddleware);

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/user-mood', userMoodRoutes);
app.use('/api/freeChat', freeChatRoutes);
app.use('/api/moodscalechat', moodScaleChatRoutes);

// Error handling middleware (must be after all routes)
app.use(errorHandler);

module.exports = app;
