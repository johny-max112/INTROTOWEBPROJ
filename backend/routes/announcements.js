const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: get all announcements with likes and comments count
router.get('/', async (req, res) => {
  try {
    // Get user ID from token if available (optional authentication)
    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
          userId = decoded.id;
        } catch (e) {
          // Invalid token, continue as guest
        }
      }
    }

    const query = `
      SELECT 
        a.*,
        u.name as author_name,
        u.avatar as author_avatar,
        COALESCE(likes_count.count, 0) as likes,
        COALESCE(comments_count.count, 0) as comments_count,
        CASE WHEN user_likes.id IS NOT NULL THEN 1 ELSE 0 END as user_liked
      FROM announcements a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count 
        FROM likes 
        WHERE parent_type = 'announcement' 
        GROUP BY parent_id
      ) likes_count ON a.id = likes_count.parent_id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count 
        FROM comments 
        WHERE parent_type = 'announcement' 
        GROUP BY parent_id
      ) comments_count ON a.id = comments_count.parent_id
      LEFT JOIN likes user_likes ON a.id = user_likes.parent_id 
        AND user_likes.parent_type = 'announcement' 
        AND user_likes.user_id = ?
      ORDER BY a.created_at DESC
    `;
    
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: create announcement
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await pool.query('INSERT INTO announcements (user_id,title,content) VALUES (?,?,?)', [req.user.id, title, content]);
    const [rows] = await pool.query('SELECT a.*, u.name as author_name, u.avatar as author_avatar FROM announcements a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: update
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    await pool.query('UPDATE announcements SET title = ?, content = ? WHERE id = ?', [title, content, id]);
    const [rows] = await pool.query('SELECT a.*, u.name as author_name, u.avatar as author_avatar FROM announcements a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: delete
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
