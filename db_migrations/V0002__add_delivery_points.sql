-- Добавляем таблицу пунктов выдачи в Абхазии
CREATE TABLE IF NOT EXISTS delivery_points_abkhazia (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем поля для пунктов выдачи в заказы
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS pickup_point_id INTEGER REFERENCES pickup_points(id),
    ADD COLUMN IF NOT EXISTS delivery_point_id INTEGER REFERENCES delivery_points_abkhazia(id);

-- Вставка начальных пунктов выдачи в Абхазии
INSERT INTO delivery_points_abkhazia (name, address, city) VALUES
    ('Бери Бокс - Сухум Центр', 'г. Сухум, ул. Ленина, 15', 'Сухум'),
    ('Бери Бокс - Гагра', 'г. Гагра, ул. Абазинская, 23', 'Гагра'),
    ('Бери Бокс - Пицунда', 'г. Пицунда, ул. Гицба, 8', 'Пицунда'),
    ('Бери Бокс - Гудаута', 'г. Гудаута, ул. Героев, 12', 'Гудаута'),
    ('Бери Бокс - Очамчира', 'г. Очамчира, ул. Лакоба, 45', 'Очамчира')
ON CONFLICT DO NOTHING;

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_delivery_points_city ON delivery_points_abkhazia(city);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_point ON orders(pickup_point_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_point ON orders(delivery_point_id);