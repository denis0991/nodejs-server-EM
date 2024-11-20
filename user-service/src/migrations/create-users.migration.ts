import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../users/user.entity';

export class CreateUsersMigration1623456789012 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const batchSize = 1000;
        const totalUsers = 1000000;

        for (let i = 0; i < totalUsers; i += batchSize) {
            const users: User[] = [];

            for (let j = 0; j < batchSize; j++) {
                const index = i + j;
                if (index >= totalUsers) break;

                users.push({
                    firstName: `FirstName${index}`,
                    lastName: `LastName${index}`,
                    age: Math.floor(Math.random() * 100),
                    gender: Math.random() > 0.5 ? 'male' : 'female',
                    hasProblems: Math.random() > 0.5,
                } as User);
            }

// Вставка текущего пакета
            await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(User)
                .values(users)
                .execute();

            console.log(`Inserted ${Math.min(i + batchSize, totalUsers)} of ${totalUsers} users`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.delete(User, {});
    }
}
