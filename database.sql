-- Create Database
CREATE DATABASE IF NOT EXISTS farm_db;
USE farm_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('admin', 'owner', 'worker') DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  source VARCHAR(100),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert demo users
INSERT INTO users (email, password, name, role) VALUES
('demo@farm.com', 'demo123', 'Demo User', 'owner'),
('worker@farm.com', 'demo123', 'Farm Worker', 'worker'),
('admin@farm.com', 'demo123', 'Admin', 'admin');

-- Insert demo income
INSERT INTO income (user_id, amount, source, description, date) VALUES
(1, 5000.00, 'Crop Sales', 'Sold wheat', CURDATE()),
(1, 3000.00, 'Dairy', 'Milk sales', CURDATE() - INTERVAL 1 DAY),
(1, 2500.00, 'Produce', 'Vegetable sales', CURDATE() - INTERVAL 2 DAY);

-- Insert demo expenses
INSERT INTO expenses (user_id, amount, category, description, date) VALUES
(1, 1500.00, 'Seeds', 'Purchased seeds for planting', CURDATE()),
(1, 2000.00, 'Labor', 'Worker wages', CURDATE() - INTERVAL 1 DAY),
(1, 800.00, 'Transport', 'Fuel for tractor', CURDATE() - INTERVAL 2 DAY);
