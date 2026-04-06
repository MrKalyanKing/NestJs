import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { AppService } from './app.service.js';
import { AuthController } from './auth/auth.controller.js'
import { AuthService } from './auth/auth.service.js';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service.js';
import { UserModule } from './user/user.module.js';
import { RegisterDto } from './auth/dto/RegisterDto.js';
import { JwtModule } from '@nestjs/jwt';
import { register } from 'module';
import "dotenv/config"



@Module({
  imports: [ConfigModule.forRoot(), UserModule,
    JwtModule.register({
      secret:process.env.JWT_SECRET,
      signOptions:{expiresIn:"1d"},
      global:true
    })
  ],
  controllers: [AuthController],
  providers: [AppService, AuthService],
})
export class AppModule { }
