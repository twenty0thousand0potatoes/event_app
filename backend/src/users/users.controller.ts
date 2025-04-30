import { Controller, Get, Patch, Body, Req, UseGuards, UnauthorizedException, Request } from '@nestjs/common'
import { UsersService } from './users.service'
import { Roles } from 'src/auth/roles.decorator'
import { Roles as Role } from '../auth/roles.enum'
import { UpdateUsernameDto } from '../auth/dto/update-username.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {

    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    
    return {
      username: user.username,
      email: user.email
    };
  }


}
