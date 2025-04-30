import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RedisService } from 'src/redis/redis.service';
import { MailService } from 'src/mail/mail.service'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailService, 
  ) {}

  async SignUp(authCredentialsDto: AuthCredentialsDto): Promise<{ temporaryToken: string }> {
    const { email, password } = authCredentialsDto;
  
    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('Этот email уже зарегистрирован!');
    }
  
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
    await this.redisService.setWithTTL(
      `verification:${email}`,
      JSON.stringify({ email, password, verificationCode, attempts: 0 }),
      300,
    );
  
    await this.mailService.sendEmail(
      email,
      'Подтверждение регистрации',
      `Ваш код подтверждения: ${verificationCode}`,
      `<h1>Ваш код: ${verificationCode}</h1>`,
    );
  
    const temporaryToken = this.jwtService.sign({ email }, { expiresIn: '5m' }); 
  
    return { temporaryToken };
  }

  async SignIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные!');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }


  async verifyEmail(code: string, temporaryToken: string): Promise<{ accessToken: string }> {
    try {
      const { email } = this.jwtService.verify(temporaryToken);
    
      const redisData = await this.redisService.get(`verification:${email}`);
      if (!redisData) {
        throw new Error('Код подтверждения истек');
      }
      const { verificationCode, password, attempts } = JSON.parse(redisData);
      
      if (attempts >= 3) {
        throw new Error('Превышено количество попыток');
      }
  
      if (code !== verificationCode) {
        await this.redisService.setWithTTL(
          `verification:${email}`,
          JSON.stringify({ ...JSON.parse(redisData), attempts: attempts + 1 }),
          300
        );
        throw new Error('Неверный код подтверждения');
      }
  
      const user = await this.usersService.createUser( email, password );
      
      const accessToken = this.jwtService.sign({ 
        sub: user.id,
        email: user.email
      });
  
      await this.redisService.delete(`verification:${email}`);
  
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async resendVerificationCode(temporaryToken: string): Promise<void> {
    let email: string;
  
    try {
      const decoded = this.jwtService.verify(temporaryToken);
      email = decoded.email;
    } catch (err) {
      throw new UnauthorizedException('Неверный или истёкший токен.');
    }
  
    const storedData = await this.redisService.get(`verification:${email}`);
    if (!storedData) {
      throw new UnauthorizedException('Верификация не найдена или истекла.');
    }
  
    const parsedData = JSON.parse(storedData);
  
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  
    await this.redisService.setWithTTL(
      `verification:${email}`,
      JSON.stringify({ ...parsedData, verificationCode: newCode, attempts: 0 }),
      300,
    );

    await this.mailService.sendEmail(
      email,
      'Повторная отправка кода подтверждения',
      `Ваш новый код подтверждения: ${newCode}`,
      `<h1>Ваш новый код: ${newCode}</h1>`,
    );
  }
  
}
