-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('home', 'pickup')),
    status VARCHAR(50) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'courier', 'transit', 'ready', 'delivered')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы пунктов выдачи
CREATE TABLE IF NOT EXISTS pickup_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы настроек
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных настроек
INSERT INTO settings (key, value, description) VALUES
    ('company_name', 'Бери Бокс', 'Название компании'),
    ('support_phone', '+7 918 123 45 67', 'Телефон поддержки'),
    ('support_email', 'info@beribox.ru', 'Email поддержки'),
    ('tariff_standard', '120', 'Базовый тариф (до 10 кг), ₽/кг'),
    ('tariff_optimal', '100', 'Оптимальный тариф (от 10 кг), ₽/кг')
ON CONFLICT (key) DO NOTHING;

-- Вставка начальных пунктов выдачи
INSERT INTO pickup_points (name, address) VALUES
    ('Озон', 'Сочи, ул. Навагинская, 12'),
    ('Wildberries', 'Сочи, ул. Конституции, 45'),
    ('Яндекс Маркет', 'Сочи, ТРЦ Моремолл'),
    ('Почта России', 'Сочи, ул. Горького, 23'),
    ('Ламода', 'Сочи, ул. Воровского, 89'),
    ('Золотое яблоко', 'Сочи, проспект Курортный, 56'),
    ('СДЭК', 'Сочи, ул. Пластунская, 34'),
    ('Boxberry', 'Сочи, ул. Донская, 78')
ON CONFLICT DO NOTHING;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);