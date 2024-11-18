import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const app = express();
const pool = new Pool({
    user: 'testintegratoin',
    host: 'rc1a-lelb808lx7mwmty0.mdb.yandexcloud.net',
    database: 'testintegratoin',
    password: 'zeghi2-cixvAb-dexkiw',
    port: 6432,
    ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync('./CA.pem'),
        },
});


// Функция для проверки соединения
// const checkConnection = async () => {
//     try {
//         const res = await pool.query('SELECT NOW()');
//         console.log('Соединение с базой данных успешно установлено:', res.rows[0]);
//     } catch (err) {
//         console.error('Ошибка при подключении к базе данных:', err);
//     } finally {
//         await pool.end();
//     }
// };

// checkConnection();


app.use(express.json());

// Создание товара
app.post('/products', async (req, res) => {
    const { plu, name } = req.body;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('INSERT INTO products (plu, name) VALUES (\$1, \$2) RETURNING *', [plu, name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) client.release();
    }
});

// Создание остатка
app.post('/stocks', async (req, res) => {
    const { product_id, shop_id, quantity_on_shelf, quantity_in_order } = req.body;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('INSERT INTO stocks (product_id, shop_id, quantity_on_shelf, quantity_in_order) VALUES (\$1, \$2, \$3, \$4) RETURNING *', [product_id, shop_id, quantity_on_shelf, quantity_in_order]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating stock:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) client.release();
    }
});

// Увеличение остатка
app.patch('/stocks/:id/increase', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('UPDATE stocks SET quantity_on_shelf = quantity_on_shelf + \$1 WHERE id = \$2 RETURNING *', [quantity, id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error increasing stock:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) client.release();
    }
});

// Уменьшение остатка
app.patch('/stocks/:id/decrease', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('UPDATE stocks SET quantity_on_shelf = quantity_on_shelf - \$1 WHERE id = \$2 RETURNING *', [quantity, id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error decreasing stock:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) client.release();
    }
});

// Получение остатков по фильтрам
app.get('/stocks', async (req, res) => {
    const { plu, shop_id, quantity_on_shelf_from, quantity_on_shelf_to, quantity_in_order_from, quantity_in_order_to } = req.query;
    let client;
    try {
        client = await pool.connect();
        const query = `
            SELECT s.*, p.name, sh.name as shop_name 
            FROM stocks s
            JOIN products p ON s.product_id = p.id
            JOIN shops sh ON s.shop_id = sh.id
            WHERE (\$1::text IS NULL OR p.plu = \$1)
              AND (\$2::int IS NULL OR s.shop_id = \$2)
              AND (\$3::int IS NULL OR s.quantity_on_shelf >= \$3)
              AND (\$4::int IS NULL OR s.quantity_on_shelf <= \$4)
              AND (\$5::int IS NULL OR s.quantity_in_order >= \$5)
              AND (\$6::int IS NULL OR s.quantity_in_order <= \$6)
        `;
        const params = [plu || null, shop_id || null, quantity_on_shelf_from || null, quantity_on_shelf_to || null, quantity_in_order_from || null, quantity_in_order_to || null];
        const result = await client.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) client.release();
    }
});

// Получение товаров по фильтрам
app.get('/products', async (req, res) => {
    const { name, plu } = req.query;
    let client;
    try {
        client = await pool.connect();
        const query = `
            SELECT * FROM products
            WHERE (\$1::text IS NULL OR name ILIKE '%' || \$1 || '%')
              AND (\$2::text IS NULL OR plu = \$2)
        `;
        const params = [name || null, plu || null];
        const result = await client.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) client.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Product service running on port ${PORT}`);
});
