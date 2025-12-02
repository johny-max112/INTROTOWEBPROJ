const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get likes count and whether current user liked
router.get('/:type/:parentId', async (req, res) => {
  try {
    const { type, parentId } = req.params;
    if (!['suggestion','discussion'].includes(type)) return res.status(400).json({ message: 'Invalid type' });
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE parent_type = ? AND parent_id = ?', [type, parentId]);
    let userLiked = false;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // We won't verify token here; client should pass authenticated requests to toggle endpoint.
    }
    res.json({ count: count || 0, userLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle like (authenticated)
router.post('/:type/:parentId/toggle', authenticateToken, async (req, res) => {
  try {
    const { type, parentId } = req.params;
    if (!['suggestion','discussion'].includes(type)) return res.status(400).json({ message: 'Invalid type' });
    const [rows] = await pool.query('SELECT * FROM likes WHERE user_id = ? AND parent_type = ? AND parent_id = ?', [req.user.id, type, parentId]);
    if (rows.length) {
      await pool.query('DELETE FROM likes WHERE id = ?', [rows[0].id]);
      const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE parent_type = ? AND parent_id = ?', [type, parentId]);
      return res.json({ liked: false, count: count || 0 });
    }
    const [result] = await pool.query('INSERT INTO likes (user_id,parent_type,parent_id) VALUES (?,?,?)', [req.user.id, type, parentId]);
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE parent_type = ? AND parent_id = ?', [type, parentId]);
    res.json({ liked: true, count: count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
