const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Residents submit private concerns
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, message } = req.body;
    const [result] = await pool.query('INSERT INTO concerns (user_id,subject,message) VALUES (?,?,?)', [userId, subject, message]);
    const [rows] = await pool.query('SELECT * FROM concerns WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list concerns
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.*, u.name as author FROM concerns c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
