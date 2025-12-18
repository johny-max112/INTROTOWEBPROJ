const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// List comments for a parent (announcement, event, suggestion, or discussion)
router.get('/:type/:parentId', async (req, res) => {
  try {
    const { type, parentId } = req.params;
    if (!['announcement','event','suggestion','discussion'].includes(type)) return res.status(400).json({ message: 'Invalid type' });
    const [rows] = await pool.query('SELECT c.*, u.name as author, u.avatar as author_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE parent_type = ? AND parent_id = ? ORDER BY created_at ASC', [type, parentId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a comment
router.post('/:type/:parentId', authenticateToken, async (req, res) => {
  try {
    const { type, parentId } = req.params;
    const { content } = req.body;
    if (!['announcement','event','suggestion','discussion'].includes(type)) return res.status(400).json({ message: 'Invalid type' });
    const [result] = await pool.query('INSERT INTO comments (user_id,parent_type,parent_id,content) VALUES (?,?,?,?)', [req.user.id, type, parentId, content]);
    const [rows] = await pool.query('SELECT c.*, u.name as author, u.avatar as author_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
