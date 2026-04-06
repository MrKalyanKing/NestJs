import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }
    async getUserByEmail(email) {
        const user = await this.prisma.users.findFirst({ where: { email } })
        return user
    }

    async createUser(data) {
        const user = await this.prisma.users.create({ data })
        return user
    }

    async storeToken(userId: number, token: string) {
        const stored_token = await this.prisma.refreshToken.create({
            data: {
                userId: userId,
                token: token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })
        return stored_token
    }

}
