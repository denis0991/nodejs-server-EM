import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import axios from 'axios';


const app = express();
const pool = new Pool({
    user: 'your data',
    host: 'your data',
    database: 'your data',
    password: 'your data',
    port: 5432,
    ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync('your file'),
        },
});


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

        await axios.post('http://localhost:4000/history', {
            product_id,
            shop_id,
            action: 'Добавлен остаток'
        });

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
        await axios.post('http://localhost:4000/history', {
            product_id: result.rows[0].product_id,
            shop_id: result.rows[0].shop_id,
            action: 'Увеличение остатка'
        });
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
        await axios.post('http://localhost:4000/history', {
            product_id: result.rows[0].product_id,
            shop_id: result.rows[0].shop_id,
            action: 'Уменьшение остатка'
        });
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

        let query = `
            SELECT s.*, p.name, sh.name as shop_name 
            FROM stocks s
            JOIN products p ON s.product_id = p.id
            JOIN shops sh ON s.shop_id = sh.id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (plu) {
            query += ` AND p.plu = $${paramIndex++}`;
            params.push(plu);
        }
        if (shop_id) {
            query += ` AND s.shop_id = $${paramIndex++}`;
            params.push(shop_id);
        }
        if (quantity_on_shelf_from) {
            query += ` AND s.quantity_on_shelf >= $${paramIndex++}`;
            params.push(quantity_on_shelf_from);
        }
        if (quantity_on_shelf_to) {
            query += ` AND s.quantity_on_shelf <= $${paramIndex++}`;
            params.push(quantity_on_shelf_to);
        }
        if (quantity_in_order_from) {
            query += ` AND s.quantity_in_order >= $${paramIndex++}`;
            params.push(quantity_in_order_from);
        }
        if (quantity_in_order_to) {
            query += ` AND s.quantity_in_order <= $${paramIndex++}`;
            params.push(quantity_in_order_to);
        }

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
        
        const queryParts = [
            `SELECT * FROM products`
        ];
        const params = [];

        if (name) {
            queryParts.push(`name ILIKE $${params.length + 1}`);
            params.push(`%${name}%`);
        }
        if (plu) {
            queryParts.push(`plu = $${params.length + 1}`);
            params.push(plu);
        }

        const finalQuery = queryParts.length > 1 ? `${queryParts[0]} WHERE ${queryParts.slice(1).join(' AND ')}` : queryParts[0];

        const result = await client.query(finalQuery, params);
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
