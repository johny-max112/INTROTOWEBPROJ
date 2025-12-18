const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// list discussions with author info, counts, and user_liked
router.get('/', async (req, res) => {
  try {
    // optional auth to compute user_liked
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
          // invalid token -> treat as guest
        }
      }
    }

    const query = `
      SELECT 
        d.*,
        u.name as author_name,
        u.avatar as author_avatar,
        COALESCE(likes_count.count, 0) as likes,
        COALESCE(comments_count.count, 0) as comments_count,
        CASE WHEN user_likes.id IS NOT NULL THEN 1 ELSE 0 END as user_liked
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count
        FROM likes
        WHERE parent_type = 'discussion'
        GROUP BY parent_id
      ) likes_count ON d.id = likes_count.parent_id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count
        FROM comments
        WHERE parent_type = 'discussion'
        GROUP BY parent_id
      ) comments_count ON d.id = comments_count.parent_id
      LEFT JOIN likes user_likes ON d.id = user_likes.parent_id
        AND user_likes.parent_type = 'discussion'
        AND user_likes.user_id = ?
      ORDER BY d.created_at DESC
    `;

    const [rows] = await pool.query(query, [userId]);
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
    const query = `
      SELECT 
        d.*,
        u.name as author_name,
        u.avatar as author_avatar,
        0 as likes,
        0 as comments_count,
        1 as user_liked
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `;
    const [rows] = await pool.query(query, [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
