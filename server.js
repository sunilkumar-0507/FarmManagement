const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL connected successfully');
    connection.release();
  } catch (error) {
    console.error('✗ MySQL connection failed:', error.message);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // TODO: Add password verification with bcrypt
    // Map database role to app format
    const user = rows[0];
    const appRole = user.role === 'admin' ? 'Admin' : user.role === 'owner' ? 'FarmOwner' : 'FarmWorker';
    user.role = appRole;
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const connection = await pool.getConnection();
    
    // Check if user exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email already exists' });
    }

    // TODO: Hash password with bcrypt before storing
    const userRole = role === 'Admin' ? 'admin' : role === 'FarmOwner' ? 'owner' : 'worker';
    const [result] = await connection.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, password, name, userRole]
    );
    connection.release();

    res.json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [income] = await connection.query('SELECT SUM(amount) as total FROM income');
    const [expenses] = await connection.query('SELECT SUM(amount) as total FROM expenses');
    
    connection.release();

    res.json({
      totalIncome: income[0]?.total || 0,
      totalExpenses: expenses[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all expenses for a user
app.get('/api/expenses', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    let query = 'SELECT id, user_id, amount, category, description, date FROM expenses';
    let params = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY date DESC';
    
    const [expenses] = await connection.query(query, params);
    connection.release();

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { userId, amount, category, description, date } = req.body;
    
    if (!userId || !amount || !category || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
      [userId, amount, category, description, date]
    );
    
    connection.release();

    res.json({ success: true, expenseId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?',
      [amount, category, description, date, id]
    );
    
    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM expenses WHERE id = ?', [id]);
    
    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all income for a user
app.get('/api/income', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    let query = 'SELECT id, user_id, amount, source, description, date FROM income';
    let params = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY date DESC';
    
    const [incomes] = await connection.query(query, params);
    connection.release();

    res.json(incomes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new income
app.post('/api/income', async (req, res) => {
  try {
    const { userId, amount, source, description, date } = req.body;
    
    if (!userId || !amount || !source || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO income (user_id, amount, source, description, date) VALUES (?, ?, ?, ?, ?)',
      [userId, amount, source, description, date]
    );
    
    connection.release();

    res.json({ success: true, incomeId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update income
app.put('/api/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, source, description, date } = req.body;
    
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE income SET amount = ?, source = ?, description = ?, date = ? WHERE id = ?',
      [amount, source, description, date, id]
    );
    
    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete income
app.delete('/api/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM income WHERE id = ?', [id]);
    
    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
testConnection();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { pool };
