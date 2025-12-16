const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register - residents only (no admin signup through this route)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const role = 'resident';

    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (exists.length) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name,email,phone,password,role) VALUES (?,?,?,?,?)', [name || null, email || null, phone || null, hashed, role]);
    res.json({ id: result.insertId, name, email, phone, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login (email or phone)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email or phone
    if (!identifier || !password) return res.status(400).json({ message: 'Missing credentials' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1', [identifier, identifier]);
    const user = rows[0];
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Get current authenticated user
router.get('/me', authenticateToken, (req, res) => {
  const user = req.user || null;
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ user: { id: user.id, name: user.name, role: user.role } });
});
