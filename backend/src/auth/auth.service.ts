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
        email: user.email, 
        role: user.role
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

  async generateResetCode(email: string): Promise<{ code: string, tempToken: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Пользователь не найден');
  
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
    await this.redisService.setWithTTL(
      `reset:${email}`,
      JSON.stringify({ email, code: resetCode, attempts: 0 }),
      300,
    );
  
    await this.mailService.sendEmail(
      email,
      'Сброс пароля',
      `Ваш код для сброса пароля: ${resetCode}`,
      `<h1>Код сброса: ${resetCode}</h1>`
    );
  
    const tempToken = this.jwtService.sign({ email }, { expiresIn: '5m' });
    return { code: resetCode, tempToken };
  }
  
  async checkResetCode(token: string, code: string): Promise<{ verifiedToken: string }> {
    if (!token) throw new UnauthorizedException('Токен сброса отсутствует или истек');
  
    const { email } = this.jwtService.verify(token);
    const redisData = await this.redisService.get(`reset:${email}`);
    if (!redisData) throw new UnauthorizedException('Истек код');
  
    const parsedData = JSON.parse(redisData);
    if (parsedData.attempts >= 3) throw new UnauthorizedException('Превышено число попыток');
  
    if (code !== parsedData.code) {
      await this.redisService.setWithTTL(
        `reset:${email}`,
        JSON.stringify({ ...parsedData, attempts: parsedData.attempts + 1 }),
        300
      );
      throw new UnauthorizedException('Неверный код');
    }
  
    await this.redisService.delete(`reset:${email}`);
    const verifiedToken = this.jwtService.sign({ email, verified: true }, { expiresIn: '5m' });
  
    return { verifiedToken };
  }
  
  async updatePasswordWithToken(token: string, password: string): Promise<void> {
    if (!token) throw new UnauthorizedException('Сессия сброса недействительна');
  
    const { email, verified } = this.jwtService.verify(token);
    if (!verified) throw new UnauthorizedException('Не подтверждено');
  
    await this.usersService.updatePassword(email, password);
  }
  
  
}
