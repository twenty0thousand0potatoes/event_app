import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';


@Module({
  imports:[UsersModule, MailModule,ConfigModule,PassportModule.register({defaultStrategy:'jwt'}), JwtModule.registerAsync({
imports:[ConfigModule],
inject:[ConfigService],
useFactory: async (configService: ConfigService) => ({
  secret: configService.get<string>('secretKey'), 
  signOptions: { expiresIn: '1h' },
}),
  })],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
