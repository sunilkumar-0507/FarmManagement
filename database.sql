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
('admin@farm.com', 'Admin@123', 'Admin User', 'admin'),
('owner@farm.com', 'Owner@123', 'Farm Owner', 'owner'),
('worker@farm.com', 'Worker@123', 'Farm Worker', 'worker');

-- Insert demo income
INSERT INTO income (user_id, amount, source, description, date) VALUES
(2, 5000.00, 'Crop Sales', 'Sold wheat', CURDATE()),
(2, 3000.00, 'Dairy', 'Milk sales', CURDATE() - INTERVAL 1 DAY);

-- Insert demo expenses
INSERT INTO expenses (user_id, amount, category, description, date) VALUES
(2, 1500.00, 'Seeds', 'Purchased seeds for planting', CURDATE()),
(2, 2000.00, 'Labor', 'Worker wages', CURDATE() - INTERVAL 1 DAY);
