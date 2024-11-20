import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import * as fs from 'fs';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'your data',
            port: 5432,
            username: 'your data',
            password: 'your data',
            database: 'your data',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            ssl: {
              rejectUnauthorized: false,
              ca: [fs.readFileSync('./CA.pem').toString()],
          },
        }),
        UsersModule,
    ],
})
export class AppModule {}