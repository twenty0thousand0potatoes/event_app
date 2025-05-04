import { Body, Controller, Headers, HttpCode, Post, Res, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @HttpCode(200)
  @Post('/signup')
  async signUp(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { temporaryToken } = await this.authService.SignUp(authCredentialsDto);
    
    res.cookie('temp_token', temporaryToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, 
      domain: 'localhost'
    });
  
    return { message: 'Код подтверждения отправлен на email' };
  }

  @HttpCode(200)
  @Post('/signin')
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    try {
      const accessToken = await this.authService.SignIn(authCredentialsDto);

      res.cookie('access_token', accessToken, {  
        httpOnly: true,
        secure: false, // true в проде (HTTPS)
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        domain: 'localhost', 
      });

      return { message: 'Login successful' };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token',{ 
      httpOnly: true,
      secure: false, // true в проде (HTTPS)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      domain: 'localhost', 
    });
    
    return { message: 'Logged out successfully' };
  }


  @Post('/verify')
  async verifyEmail(
    @Body('code') code: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const temporaryToken = req.cookies.temp_token;

    if (!temporaryToken) {
      throw new UnauthorizedException('Сессия истекла');
    }
  
    const accessToken  = await this.authService.verifyEmail(code, temporaryToken);
    
    res.clearCookie('temp_token');
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: 'localhost'
    });
  
    return { message: 'Email успешно подтвержден' };
  }

  @Post('/resend-code')
  async resendCode(@Req() req: Request) {
    const cookie = req.cookies?.temp_token; 

    if (!cookie) {
      throw new UnauthorizedException('Нет токена в cookies');
    }
  
    return await this.authService.resendVerificationCode(cookie);
  }
}