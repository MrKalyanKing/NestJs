import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
    exports:[UserService],
    providers:[UserService,PrismaService]
})
export class UserModule {}
