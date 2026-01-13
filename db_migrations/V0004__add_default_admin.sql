-- Создание админского пользователя по умолчанию
INSERT INTO users (email, password_hash, name, phone, is_admin)
VALUES (
  'admin@berrybox.ru',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  'Администратор',
  '+7 918 000 00 00',
  TRUE
)
ON CONFLICT (email) DO NOTHING;