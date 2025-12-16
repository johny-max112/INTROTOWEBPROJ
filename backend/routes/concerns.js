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
    console.log('[concerns] new concern inserted id:', result.insertId, 'by user:', userId);
    const [rows] = await pool.query('SELECT * FROM concerns WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get concerns: residents see only their own, admins see all
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    let query, params;
    if (isAdmin) {
      // Admin sees all concerns with resident info
      query = 'SELECT c.*, u.name as author, u.id as author_id FROM concerns c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC';
      params = [];
    } else {
      // Resident sees only their own concerns
      query = 'SELECT c.*, u.name as author, u.id as author_id FROM concerns c LEFT JOIN users u ON c.user_id = u.id WHERE c.user_id = ? ORDER BY c.created_at DESC';
      params = [userId];
    }
    
    const [rows] = await pool.query(query, params);

    // fetch replies for these concerns
    const ids = rows.map(r => r.id);
    let replies = [];
    if (ids.length) {
      try {
        const [rrows] = await pool.query('SELECT cr.*, u.name as admin_name FROM concern_replies cr LEFT JOIN users u ON cr.admin_id = u.id WHERE cr.concern_id IN (?) ORDER BY cr.created_at ASC', [ids]);
        replies = rrows;
      } catch (err) {
        console.warn('Could not fetch concern replies, table may not exist yet:', err.message);
        replies = [];
      }
    }

    // attach replies array to each concern
    const mapped = rows.map(r => ({ ...r, replies: replies.filter(x => x.concern_id === r.id) }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: reply to a concern
router.post('/:id/reply', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const concernId = req.params.id;
    const adminId = req.user.id;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: 'Message required' });

    // ensure replies table exists (safe to run repeatedly)
    await pool.query(`CREATE TABLE IF NOT EXISTS concern_replies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      concern_id INT NOT NULL,
      admin_id INT NOT NULL,
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    const [result] = await pool.query('INSERT INTO concern_replies (concern_id,admin_id,message) VALUES (?,?,?)', [concernId, adminId, message]);
    const [rows] = await pool.query('SELECT cr.*, u.name as admin_name FROM concern_replies cr LEFT JOIN users u ON cr.admin_id = u.id WHERE cr.id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: get replies for a concern
router.get('/:id/replies', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const concernId = req.params.id;
    const [rows] = await pool.query('SELECT cr.*, u.name as admin_name FROM concern_replies cr LEFT JOIN users u ON cr.admin_id = u.id WHERE cr.concern_id = ? ORDER BY cr.created_at ASC', [concernId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Temporary debug endpoint — returns concerns without auth when not in production
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT c.*, u.name as author FROM concerns c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC');
      res.json(rows);
    } catch (err) {
      console.error('debug /concerns failed', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
}
