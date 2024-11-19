import express, { Request, Response } from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';


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

app.use(cors());
app.use(express.json());

// Интерфейс для записи истории действий
interface ProductHistory {
    id?: number;
    product_id: number;
    shop_id: number;
    action: string;
    created_at?: Date;
}

// Создание записи о действии с товаром
app.post('/history', async (req, res) => {
    const { product_id, shop_id, action }: ProductHistory = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO actions (product_id, shop_id, action) VALUES (\$1, \$2, \$3) RETURNING *',
            [product_id, shop_id, action]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Получение истории действий по фильтрам
app.get('/history', async (req: Request, res: Response) => {
    const { shop_id, plu, date_from, date_to, action, page = 1, limit = 10 } = req.query;
    const queryParts: string[] = ['SELECT * FROM actions WHERE 1=1'];
    const params: (string | number)[] = [];

    if (shop_id) {
        queryParts.push(`AND shop_id = $${params.length + 1}`);
        params.push(String(shop_id));
    }
    if (plu) {
        queryParts.push(`AND product_id IN (SELECT id FROM products WHERE plu = $${params.length + 1})`);
        params.push(String(plu));
    }
    if (date_from) {
        queryParts.push(`AND created_at >= $${params.length + 1}`);
        params.push(String(date_from));
    }
    if (date_to) {
        queryParts.push(`AND created_at <= $${params.length + 1}`);
        params.push(String(date_to));
    }
    if (action) {
        queryParts.push(`AND action = $${params.length + 1}`);
        params.push(String(action));
    }

    const offset = (Number(page) - 1) * Number(limit);
    try {
        const result = await pool.query(
            `${queryParts.join(' ')} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, Number(limit), offset]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Запуск сервиса
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`History service running on port ${PORT}`);
});
