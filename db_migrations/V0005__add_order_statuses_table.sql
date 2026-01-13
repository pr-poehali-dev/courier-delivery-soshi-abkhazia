-- Создание таблицы для кастомных статусов заказов
CREATE TABLE IF NOT EXISTS order_statuses (
  id SERIAL PRIMARY KEY,
  status_key VARCHAR(50) UNIQUE NOT NULL,
  status_label VARCHAR(100) NOT NULL,
  status_color VARCHAR(50) NOT NULL DEFAULT 'bg-gray-100 text-gray-800',
  order_position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление стандартных статусов
INSERT INTO order_statuses (status_key, status_label, status_color, order_position)
VALUES 
  ('processing', 'В обработке', 'bg-yellow-100 text-yellow-800', 1),
  ('courier', 'У курьера', 'bg-blue-100 text-blue-800', 2),
  ('transit', 'В доставке', 'bg-purple-100 text-purple-800', 3),
  ('ready', 'Готов к получению', 'bg-green-100 text-green-800', 4),
  ('delivered', 'Выдан', 'bg-gray-100 text-gray-800', 5)
ON CONFLICT (status_key) DO NOTHING;