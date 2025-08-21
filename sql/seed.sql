INSERT INTO roles (role_name) VALUES ('Admin'), ('BaseCommander'), ('LogisticsOfficer');

INSERT INTO bases (base_name, location) VALUES
('Alpha Base','North Sector'),
('Bravo Base','East Sector');

INSERT INTO assets (asset_name, asset_type, unit) VALUES
('Humvee', 'Vehicle', 'pcs'),
('AK-47', 'Weapon', 'pcs'),
('5.56mm Ammo', 'Ammunition', 'rounds');

-- Passwords are bcrypt hashes of: password123
INSERT INTO users (username, password_hash, role_id, base_id) VALUES
('admin', '$2a$10$z2bGxO0oP9kQn5Bv1e7/1uQ2qf5OeQp2gFQm7lW0cY8z6W8qJ1h1u', 1, NULL),
('commander_alpha', '$2a$10$z2bGxO0oP9kQn5Bv1e7/1uQ2qf5OeQp2gFQm7lW0cY8z6W8qJ1h1u', 2, 1),
('log_alpha', '$2a$10$z2bGxO0oP9kQn5Bv1e7/1uQ2qf5OeQp2gFQm7lW0cY8z6W8qJ1h1u', 3, 1);

INSERT INTO inventory (base_id, asset_id, opening_balance, closing_balance) VALUES
(1, 1, 10, 10), -- 10 Humvees at Alpha Base
(1, 2, 50, 50), -- 50 AK-47s at Alpha Base
(1, 3, 1000, 1000); -- 1000 5.56mm Ammo at Alpha Base



