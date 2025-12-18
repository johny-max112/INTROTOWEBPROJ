const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get events with likes and comments count
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
        e.*,
        u.name as author_name,
        u.avatar as author_avatar,
        COALESCE(likes_count.count, 0) as likes,
        COALESCE(comments_count.count, 0) as comments_count,
        CASE WHEN user_likes.id IS NOT NULL THEN 1 ELSE 0 END as user_liked
      FROM events e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count 
        FROM likes 
        WHERE parent_type = 'event' 
        GROUP BY parent_id
      ) likes_count ON e.id = likes_count.parent_id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count 
        FROM comments 
        WHERE parent_type = 'event' 
        GROUP BY parent_id
      ) comments_count ON e.id = comments_count.parent_id
      LEFT JOIN likes user_likes ON e.id = user_likes.parent_id 
        AND user_likes.parent_type = 'event' 
        AND user_likes.user_id = ?
      ORDER BY e.event_date DESC
    `;
    
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin create
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { title, description, event_date } = req.body;
    const [result] = await pool.query('INSERT INTO events (user_id,title,description,event_date) VALUES (?,?,?,?)', [req.user.id, title, description, event_date]);
    const [rows] = await pool.query('SELECT e.*, u.name as author_name, u.avatar as author_avatar FROM events e LEFT JOIN users u ON e.user_id = u.id WHERE e.id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin update
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date } = req.body;
    await pool.query('UPDATE events SET title = ?, description = ?, event_date = ? WHERE id = ?', [title, description, event_date, id]);
    const [rows] = await pool.query('SELECT e.*, u.name as author_name, u.avatar as author_avatar FROM events e LEFT JOIN users u ON e.user_id = u.id WHERE e.id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin delete
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
