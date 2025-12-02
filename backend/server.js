require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const authRoutes = require('./routes/auth');
const announcementsRoutes = require('./routes/announcements');
const eventsRoutes = require('./routes/events');
const suggestionsRoutes = require('./routes/suggestions');
const discussionsRoutes = require('./routes/discussions');
const concernsRoutes = require('./routes/concerns');
const usersRoutes = require('./routes/users');
const commentsRoutes = require('./routes/comments');
const likesRoutes = require('./routes/likes');

const app = express();
app.use(cors());
app.use(express.json());

// ensure uploads directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
try {
	if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
	if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
} catch (err) {
	console.error('Failed to create uploads directories', err);
}

// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// request logger for debugging
app.use((req, res, next) => {
	console.log(new Date().toISOString(), req.method, req.url);
	next();
});

app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/concerns', concernsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/likes', likesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
