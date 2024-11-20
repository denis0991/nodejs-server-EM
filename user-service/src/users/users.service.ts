import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';



@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async resetProblemFlag(): Promise<number> {
        const usersWithProblem = await this.usersRepository.count({ where: { hasProblems: true } });

        await this.usersRepository.update({ hasProblems: true }, { hasProblems: false });

        return usersWithProblem;
    }
}