const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// list discussions
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT d.*, u.name as author FROM discussions d LEFT JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// create discussion post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;
    const [result] = await pool.query('INSERT INTO discussions (user_id,title,content) VALUES (?,?,?)', [userId, title, content]);
    const [rows] = await pool.query('SELECT * FROM discussions WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
