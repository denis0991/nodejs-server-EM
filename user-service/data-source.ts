import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { CreateUsersMigration1623456789012 } from './src/migrations/create-users.migration';
import * as fs from 'fs';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'your data',
    port: 5432,
    username: 'your data',
    password: 'your data',
    database: 'your data',
    synchronize: false,
    logging: false,
    entities: [User ],
    migrations: [CreateUsersMigration1623456789012],
    subscribers: [],
    ssl: {
        rejectUnauthorized: true,
        ca: [fs.readFileSync('./CA.pem').toString()],
    },
});
