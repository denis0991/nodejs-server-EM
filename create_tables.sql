-- Создание таблицы для хранения информации о товарах
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    plu VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- Создание таблицы для хранения информации о магазинах
CREATE TABLE shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Создание таблицы для хранения остатков товаров
CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    shop_id INT REFERENCES shops(id) ON DELETE CASCADE,
    quantity_on_shelf INT NOT NULL DEFAULT 0,
    quantity_in_order INT NOT NULL DEFAULT 0
);

-- Создание таблицы для хранения истории действий с товарами
CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    shop_id INT REFERENCES shops(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
