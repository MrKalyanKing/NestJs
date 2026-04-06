import { Controller, Get, Post, Body,Res,Req ,UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/RegisterDto.js';
import { LoginDto } from './dto/LoginDto.js';
import type { Response,Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        // console.log(registerDto)
        return this.authService.create(registerDto)
    }

    

    @Post("login")
   async Login( @Body() loginDto:LoginDto , @Res({ passthrough: true }) res: Response){
        
        const {access_token,refresh_token} = await this.authService.Login(loginDto)


        res.cookie('access_token', access_token, { httpOnly: true });
        res.cookie('refresh_token', refresh_token, { httpOnly: true });

        return{msg:"Login Succesfully"}

    }

    @Post("refresh")
    async refresh( @Req() req:Request,@Res() res:Response ){

        const refreshToken= req.cookies['refresh_token']

        if(!refreshToken){
            throw new UnauthorizedException('No refresh token');
        }

        const tokens = await this.authService.refreshToken(refreshToken);

        res.cookie('access_token', tokens.access_token, {
            httpOnly: true,
        });

        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
        });

        return { message: 'Token refreshed' };


    }
}
