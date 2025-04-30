import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  singUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ temporaryToken: string }> {
    return this.authService.SignUp(authCredentialsDto);
  }

  @Post('/signin')
  singIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.SignIn(authCredentialsDto);
  }

  @Post('/verify')
  verifyEmail(
    @Body('code') code: string,
    @Headers('authorization') authHeader: string,
  ): Promise<{ accessToken: string }> {
    const temporaryToken = authHeader?.replace('Bearer ', '');
    if (!temporaryToken) {
      throw new Error('Token not provided in Authorization header');
    }

    return this.authService.verifyEmail(code, temporaryToken);
  }

  @Post('resend-code')
  async resendCode(@Headers('Authorization') authHeader: string) {
    const temporaryToken = authHeader?.split(' ')[1]
    return this.authService.resendVerificationCode(temporaryToken)
  }
}
