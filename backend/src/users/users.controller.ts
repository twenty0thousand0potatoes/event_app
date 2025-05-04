import { Controller, Get, Patch, Body, Req, UseGuards, UnauthorizedException, Request, ForbiddenException } from '@nestjs/common'
import { UsersService } from './users.service'
import { Roles } from 'src/auth/roles.decorator'
import { Roles as Role } from '../auth/roles.enum'
import { UpdateUsernameDto } from '../auth/dto/update-username.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/roles.guard'

@Controller('users')
@UseGuards(JwtAuthGuard) 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@Request() req) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден!');
    }
    
    return {
      username: user.username,
      email: user.email,
      role: user.role
    };
  }


  @Patch('me/username')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
  async updateOwnUsername(@Request() req, @Body() dto: UpdateUsernameDto) {
    const userId = req.user.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден!');
    }

    return this.usersService.updateUsername(userId, dto);
  }




}
