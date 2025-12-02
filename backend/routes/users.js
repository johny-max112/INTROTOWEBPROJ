const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'avatars')),
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get public profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id,name,email,phone,role,bio,avatar,created_at FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update own profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, bio, avatar, phone } = req.body;
    await pool.query('UPDATE users SET name = ?, bio = ?, avatar = ?, phone = ? WHERE id = ?', [name, bio, avatar, phone, id]);
    const [rows] = await pool.query('SELECT id,name,email,phone,role,bio,avatar,created_at FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve user's avatar (support legacy clients that request /api/users/:id/avatar)
router.get('/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT avatar FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).send('Not found');
    const avatar = rows[0].avatar;
    if (!avatar) return res.status(404).send('No avatar');
    // If avatar is a full URL, redirect
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return res.redirect(avatar);
    }
    // If avatar is stored under /uploads, serve the file
    if (avatar.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', avatar);
      return res.sendFile(filePath, err => {
        if (err) {
          console.error('sendFile error', err);
          res.status(404).send('Not found');
        }
      });
    }
    // fallback: not a recognized path
    res.status(404).send('Not found');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Upload avatar for user
router.post('/:id/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // validate simple image mime types
    if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
      // remove the file if it's not an image
      try { require('fs').unlinkSync(req.file.path); } catch(e){}
      return res.status(400).json({ message: 'Uploaded file is not an image' });
    }
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, id]);
    const [rows] = await pool.query('SELECT id,name,email,phone,role,bio,avatar,created_at FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while uploading avatar' });
  }
});

module.exports = router;
