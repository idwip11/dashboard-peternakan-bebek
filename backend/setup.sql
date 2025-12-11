-- SQL Script untuk membuat database dan tables secara manual
-- Hanya jika Anda prefer SQL dibanding Prisma db push

CREATE DATABASE IF NOT EXISTS duck_farm_db;
USE duck_farm_db;

-- Table: batches
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('pedaging', 'petelur') NOT NULL,
  start_date DATE NOT NULL,
  population INT NOT NULL,
  initial_population INT NOT NULL,
  age INT NOT NULL,
  status ENUM('aktif', 'panen', 'selesai') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: daily_records
CREATE TABLE IF NOT EXISTS daily_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  record_date DATE NOT NULL,
  mortality INT DEFAULT 0,
  feed_consumption DECIMAL(10,2) DEFAULT 0,
  egg_production INT DEFAULT 0,
  egg_weight DECIMAL(10,2) DEFAULT 0,
  rejected_eggs INT DEFAULT 0,
  avg_weight DECIMAL(10,2) DEFAULT 0,
  expenses DECIMAL(15,2) DEFAULT 0,
  revenue DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_batch_date (batch_id, record_date)
);

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('whatsapp_number', ''),
('mortality_threshold', '1.5'),
('fcr_threshold', '2.0'),
('hdp_threshold', '70'),
('stock_threshold', '3')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- Sample data for testing (optional)
INSERT INTO batches (name, type, start_date, population, initial_population, age, status) VALUES
('Kandang A - Pedaging', 'pedaging', '2024-11-01', 980, 1000, 39, 'aktif'),
('Kandang B - Petelur', 'petelur', '2024-09-15', 1450, 1500, 86, 'aktif'),
('Kandang C - Pedaging', 'pedaging', '2024-11-20', 995, 1000, 20, 'aktif');
