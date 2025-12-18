const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// list suggestions
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
        s.*,
        u.name as author_name,
        u.avatar as author_avatar,
        COALESCE(likes_count.count, 0) as likes,
        COALESCE(comments_count.count, 0) as comments_count,
        CASE WHEN user_likes.id IS NOT NULL THEN 1 ELSE 0 END as user_liked
      FROM suggestions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count 
        FROM likes 
        WHERE parent_type = 'suggestion' 
        GROUP BY parent_id
      ) likes_count ON s.id = likes_count.parent_id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count 
        FROM comments 
        WHERE parent_type = 'suggestion' 
        GROUP BY parent_id
      ) comments_count ON s.id = comments_count.parent_id
      LEFT JOIN likes user_likes ON s.id = user_likes.parent_id 
        AND user_likes.parent_type = 'suggestion' 
        AND user_likes.user_id = ?
      ORDER BY s.created_at DESC
    `;
    
    const [rows] = await pool.query(query, [userId]);
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
