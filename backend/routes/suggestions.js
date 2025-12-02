const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// list suggestions
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.*, u.name as author FROM suggestions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// create suggestion (resident)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;
    const [result] = await pool.query('INSERT INTO suggestions (user_id,title,content) VALUES (?,?,?)', [userId, title, content]);
    const [rows] = await pool.query('SELECT * FROM suggestions WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
