-- VPN Bot Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  balance DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_telegram_id (telegram_id)
);

CREATE TABLE IF NOT EXISTS configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  config_link TEXT NOT NULL,
  sub_link TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active)
);

CREATE TABLE IF NOT EXISTS purchases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  config_id INT NOT NULL,
  plan_type ENUM('bronze', 'silver', 'gold') NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  data_used DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (config_id) REFERENCES configs(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expiry_date (expiry_date),
  INDEX idx_is_active (is_active)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  crypto_type ENUM('BTC', 'ETH', 'USDT', 'USDC') NOT NULL,
  txid VARCHAR(255),
  crypto_address VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by BIGINT,
  rejection_reason TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  role ENUM('admin', 'superadmin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_telegram_id (telegram_id)
);

CREATE TABLE IF NOT EXISTS broadcast_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message TEXT NOT NULL,
  sent_by BIGINT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recipients_count INT DEFAULT 0,
  INDEX idx_sent_at (sent_at)
);

-- Create initial admin user (replace with your telegram ID)
-- INSERT INTO admin_users (telegram_id, username, role) VALUES (123456789, 'admin_username', 'superadmin');
