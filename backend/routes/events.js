const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get events
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date DESC');
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
    const [result] = await pool.query('INSERT INTO events (title,description,event_date) VALUES (?,?,?)', [title, description, event_date]);
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
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
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
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
