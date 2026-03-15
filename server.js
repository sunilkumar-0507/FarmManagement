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

// Demo data for when database is offline
const DEMO_USERS = [
  { id: 1, email: 'demo@farm.com', password: 'demo123', name: 'Demo User', role: 'owner' },
  { id: 2, email: 'worker@farm.com', password: 'demo123', name: 'Farm Worker', role: 'worker' },
  { id: 3, email: 'admin@farm.com', password: 'demo123', name: 'Admin', role: 'admin' }
];

const DEMO_EXPENSES = [
  { id: 1, user_id: 1, amount: 1500.00, category: 'Seeds', description: 'Purchased seeds for planting', date: '2026-03-15' },
  { id: 2, user_id: 1, amount: 2000.00, category: 'Labor', description: 'Worker wages', date: '2026-03-14' },
  { id: 3, user_id: 1, amount: 800.00, category: 'Transport', description: 'Fuel for tractor', date: '2026-03-13' }
];

const DEMO_INCOMES = [
  { id: 1, user_id: 1, amount: 5000.00, source: 'Crop Sales', description: 'Sold wheat', date: '2026-03-15' },
  { id: 2, user_id: 1, amount: 3000.00, source: 'Dairy', description: 'Milk sales', date: '2026-03-14' },
  { id: 3, user_id: 1, amount: 2500.00, source: 'Produce', description: 'Vegetable sales', date: '2026-03-12' }
];

let dbConnected = false;

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL connected successfully');
    dbConnected = true;
    connection.release();
  } catch (error) {
    console.error('✗ MySQL connection failed:', error.message);
    console.log('ℹ Using demo data instead');
    dbConnected = false;
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
    
    // Try database first
    if (dbConnected) {
      try {
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
        const user = rows[0];
        const appRole = user.role === 'admin' ? 'Admin' : user.role === 'owner' ? 'FarmOwner' : 'FarmWorker';
        user.role = appRole;
        return res.json({ success: true, user });
      } catch (dbError) {
        console.warn('Database query failed, using demo data');
        dbConnected = false;
      }
    }

    // Fallback to demo data
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const appRole = user.role === 'admin' ? 'Admin' : user.role === 'owner' ? 'FarmOwner' : 'FarmWorker';
    return res.json({ success: true, user: { ...user, role: appRole } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Try database first
    if (dbConnected) {
      try {
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

        return res.json({ success: true, userId: result.insertId });
      } catch (dbError) {
        console.warn('Database query failed, using demo mode');
        dbConnected = false;
      }
    }

    // Demo mode: reject registration (show message)
    return res.status(400).json({ error: 'Registration unavailable. Use demo@farm.com / demo123 to test.' });
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
    
    // Try database first
    if (dbConnected) {
      try {
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

        return res.json(expenses);
      } catch (dbError) {
        console.warn('Database query failed, using demo data');
        dbConnected = false;
      }
    }

    // Demo mode: return demo expenses
    const expenses = userId ? DEMO_EXPENSES.filter(e => e.user_id == userId) : DEMO_EXPENSES;
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

    // Database only (demo mode cannot save new records)
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database unavailable. Demo mode: viewing only.' });
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
    
    // Try database first
    if (dbConnected) {
      try {
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

        return res.json(incomes);
      } catch (dbError) {
        console.warn('Database query failed, using demo data');
        dbConnected = false;
      }
    }

    // Demo mode: return demo incomes
    const incomes = userId ? DEMO_INCOMES.filter(i => i.user_id == userId) : DEMO_INCOMES;
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

    // Database only (demo mode cannot save new records)
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database unavailable. Demo mode: viewing only.' });
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
