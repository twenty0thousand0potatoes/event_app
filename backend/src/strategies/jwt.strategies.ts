import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    const secretKey = configService.get<string>('secretKey');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) =>
          req?.cookies?.access_token, 
      ]),
      ignoreExpiration: false,
      secretOrKey: secretKey, 
    });
  }

  async validate(payload: any) {

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден!');
    }

    return {
      sub: user.id,     
      username: user.username,
      role: user.role,   
    };
  }
}
