-- MySQL schema for MAMS

CREATE TABLE IF NOT EXISTS roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name ENUM('Admin','BaseCommander','LogisticsOfficer') UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS bases (
  base_id INT AUTO_INCREMENT PRIMARY KEY,
  base_name VARCHAR(150) NOT NULL,
  location VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  base_id INT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (base_id) REFERENCES bases(base_id)
);

CREATE TABLE IF NOT EXISTS assets (
  asset_id INT AUTO_INCREMENT PRIMARY KEY,
  asset_name VARCHAR(150) NOT NULL,
  asset_type ENUM('Vehicle','Weapon','Ammunition','Other') NOT NULL,
  unit VARCHAR(20) DEFAULT 'pcs',
  description TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  base_id INT NOT NULL,
  asset_id INT NOT NULL,
  opening_balance INT DEFAULT 0,
  closing_balance INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_base_asset (base_id, asset_id),
  FOREIGN KEY (base_id) REFERENCES bases(base_id),
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  base_id INT NOT NULL,
  asset_id INT NOT NULL,
  transaction_type ENUM('Purchase','TransferIn','TransferOut','Assignment','Expenditure') NOT NULL,
  quantity INT NOT NULL,
  related_base INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  remarks VARCHAR(255),
  FOREIGN KEY (base_id) REFERENCES bases(base_id),
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (related_base) REFERENCES bases(base_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id),
  INDEX idx_tx_filters (base_id, asset_id, transaction_type, created_at)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  path VARCHAR(255) NOT NULL,
  payload JSON NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  INDEX idx_audit_time (timestamp)
);
