INSERT INTO users (id, name, email, country, created_at) VALUES
  (1, 'Alice',  'alice@example.com',  'JP', '2024-01-15'),
  (2, 'Bob',    'bob@example.com',    'US', '2024-02-03'),
  (3, 'Chika',  'chika@example.com',  'JP', '2024-02-20'),
  (4, 'Daniel', 'daniel@example.com', 'UK', '2024-03-11'),
  (5, 'Emma',   'emma@example.com',   'US', '2024-04-01'),
  (6, 'Fumiya', 'fumiya@example.com', 'JP', '2024-05-18'),
  (7, 'Grace',  'grace@example.com',  'UK', '2024-06-30'),
  (8, 'Hiro',   'hiro@example.com',   'JP', '2025-01-09');

INSERT INTO categories (id, name, parent_id) VALUES
  (1, 'Electronics', NULL),
  (2, 'Books',       NULL),
  (3, 'Laptops',     1),
  (4, 'Audio',       1),
  (5, 'Novels',      2),
  (6, 'Technical',   2);

INSERT INTO products (id, name, category_id, price, stock) VALUES
  (1,  'ThinkBook 14',     3, 120000, 5),
  (2,  'AirBook Pro',      3, 210000, 2),
  (3,  'Noise Cancel HP',  4, 32000,  20),
  (4,  'Wireless Earbuds', 4, 15000,  0),
  (5,  'Bluetooth Speaker',4, 9800,   12),
  (6,  'Kokoro',           5, 700,    50),
  (7,  'Norwegian Wood',   5, 900,    30),
  (8,  'SQL Antipatterns', 6, 3800,   8),
  (9,  'Designing Data',   6, 5200,   0),
  (10, 'Clean Code',       6, 4400,   15),
  (11, 'USB-C Hub',        1, 4500,   40),
  (12, 'Mechanical KB',    1, 18000,  7),
  (13, 'Ergo Mouse',       1, 6500,   25);

INSERT INTO orders (id, user_id, status, ordered_at, coupon_code) VALUES
  (1,  1, 'paid',      '2024-03-01', NULL),
  (2,  1, 'shipped',   '2024-04-10', 'SPRING10'),
  (3,  2, 'paid',      '2024-04-12', NULL),
  (4,  3, 'cancelled', '2024-05-02', NULL),
  (5,  3, 'paid',      '2024-05-20', 'WELCOME'),
  (6,  4, 'shipped',   '2024-06-15', NULL),
  (7,  1, 'paid',      '2024-07-07', NULL),
  (8,  5, 'pending',   '2024-08-21', 'SUMMER5'),
  (9,  2, 'shipped',   '2024-09-09', NULL),
  (10, 6, 'paid',      '2024-10-31', NULL),
  (11, 3, 'shipped',   '2024-11-11', 'FALL15'),
  (12, 1, 'cancelled', '2024-12-24', NULL),
  (13, 4, 'paid',      '2025-01-05', NULL),
  (14, 6, 'paid',      '2025-02-14', 'LOVE'),
  (15, 2, 'pending',   '2025-03-03', NULL);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
  (1,  1,  8,  1, 3800),
  (2,  1,  10, 1, 4400),
  (3,  2,  1,  1, 120000),
  (4,  2,  11, 2, 4500),
  (5,  3,  3,  1, 32000),
  (6,  4,  2,  1, 210000),
  (7,  5,  6,  3, 700),
  (8,  5,  7,  1, 900),
  (9,  6,  12, 1, 18000),
  (10, 6,  11, 1, 4500),
  (11, 7,  5,  2, 9800),
  (12, 8,  9,  1, 5200),
  (13, 9,  4,  2, 15000),
  (14, 9,  3,  1, 32000),
  (15, 10, 8,  2, 3800),
  (16, 11, 2,  1, 210000),
  (17, 11, 3,  1, 32000),
  (18, 12, 1,  1, 120000),
  (19, 13, 10, 3, 4400),
  (20, 13, 6,  1, 700),
  (21, 14, 12, 1, 18000),
  (22, 14, 5,  1, 9800),
  (23, 15, 7,  4, 900);
