-- Добавляем поля габаритов в заказы
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS length DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2);

-- Создаем таблицу FAQ
CREATE TABLE IF NOT EXISTS faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных FAQ
INSERT INTO faq (question, answer, order_position) VALUES
    ('Как быстро доставляете посылки?', 'Минимальный срок доставки из Сочи в Абхазию составляет 1 день. В зависимости от загруженности и погодных условий доставка может занять до 2-3 дней.', 1),
    ('Откуда вы забираете посылки?', 'Мы забираем посылки из всех крупных пунктов выдачи в Сочи: Озон, Wildberries, Яндекс Маркет, Почта России, Ламода, Золотое яблоко, СДЭК и Boxberry.', 2),
    ('Как рассчитывается стоимость доставки?', 'Стоимость зависит от веса и габаритов посылки. Базовый тариф: 120₽/кг до 10 кг, от 10 кг — 100₽/кг. Крупногабаритные посылки рассчитываются индивидуально.', 3),
    ('Можно ли отследить заказ?', 'Да! После оформления заказа вы получите уникальный номер для отслеживания. В личном кабинете можно видеть актуальный статус доставки.', 4),
    ('Как получить посылку?', 'Вы можете выбрать доставку курьером на дом в Абхазии или самовывоз из наших пунктов выдачи в Сухуме, Гагре, Пицунде, Гудауте или Очамчире.', 5),
    ('Что делать, если посылка повреждена?', 'При получении обязательно осмотрите посылку в присутствии курьера. Если есть повреждения — составьте акт. Мы страхуем все отправления и возместим ущерб.', 6)
ON CONFLICT DO NOTHING;

-- Обновляем настройки для тарифов с габаритами
INSERT INTO settings (key, value, description) VALUES
    ('tariff_volume_factor', '5000', 'Коэффициент для расчета объемного веса (см³ → кг)'),
    ('chat_enabled', 'true', 'Включить чат на сайте'),
    ('chat_phone', '+7 918 123 45 67', 'Номер телефона для чата'),
    ('chat_telegram', '@beribox_support', 'Telegram для чата'),
    ('chat_whatsapp', '+79181234567', 'WhatsApp для чата')
ON CONFLICT (key) DO NOTHING;

-- Создаем индекс для FAQ
CREATE INDEX IF NOT EXISTS idx_faq_order ON faq(order_position);