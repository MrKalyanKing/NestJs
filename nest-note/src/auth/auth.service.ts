import { ConflictException, Injectable, Post, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import bcrypt from "bcrypt"
import { RegisterDto } from './dto/RegisterDto.js';
import "dotenv/config"
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service.js';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private JwtService: JwtService,readonly Prisma:PrismaService) { }
    @Post()
    async create(data) {
        const user = await this.userService.getUserByEmail(data.email)

        if (user) {
            throw new ConflictException("Email is already taken!")
        }

        const hash = await bcrypt.hash(data.password, 10)

        const newUser = await this.userService.createUser({ ...data, password: hash })

        return newUser
    }

    async generateToken(userId: number) {

        const payload = { sub: userId }

        const access_token = await this.JwtService.signAsync(
            payload, { secret: process.env.JWT_SECRET_ACCESS, expiresIn: '15m' }
        )

        const refresh_token = await this.JwtService.signAsync(payload,
            { secret: process.env.JWT_SECRET_REFRRESH, expiresIn: "3d" }
        )

        return { access_token, refresh_token }
    }

    async saveRefreshToken(userId: number, refresh_token: string) {

        const hashed_token = await bcrypt.hash(refresh_token, 10)

        const saved_Token = await this.userService.storeToken(userId, refresh_token)

        return saved_Token

    }

    async Login(data) {


        const user = await this.validateUser(data)

        const {access_token,refresh_token}=await this.generateToken(user.id)

        const stored_token=await this.userService.storeToken(user.id,refresh_token)

        return {access_token,refresh_token}

        

    }

    async validateUser(data){

        const user =await this.userService.getUserByEmail(data)
        if (!user) {
            throw new NotFoundException("User Not Found")
        }

        const isvalid = await bcrypt.compare(data.password, user.password)
        if (!isvalid) {
            throw new UnauthorizedException()
        }
         return user
    }

    async refreshToken(refreshToken:string){

        const payload=await this.JwtService.verifyAsync(refreshToken,{
            secret:process.env.JWT_SECRET_REFRRESH
        })

        const userId=payload.sub

        const stored_token=await this.Prisma.refreshToken.findMany({
            where:{userId,revoked:false}
        })

        let matchedToken

        for(let tokens of stored_token){
            const isMatch=await bcrypt.compare(tokens,tokens.token)

            if(isMatch){
                matchedToken=tokens
                break
            }
        }
        if(!matchedToken){
             throw new UnauthorizedException('Invalid refresh token');
        }

         // 4. revoke old token
        await this.Prisma.refreshToken.update({
            where: { id: matchedToken.id },
            data: { revoked: true },
        });

        // 5. generate new tokens
        const { access_token, refresh_token } =
            await this.generateToken(userId);

        // 6. store new refresh token
        await this.saveRefreshToken(userId, refresh_token);

        return { access_token, refresh_token };

            }
        }
