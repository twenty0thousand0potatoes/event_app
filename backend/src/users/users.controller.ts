import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/auth/roles.decorator'
import { Roles as Role } from '../auth/roles.enum'
import { UpdateUsernameDto } from '../auth/dto/update-username.dto'
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles(Role.USER, Role.ADMIN)
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.sub)
  } 

  @Patch('username')
  @Roles(Role.USER)
  async updateUsername(@Req() req, @Body() dto: UpdateUsernameDto) {
    return this.usersService.updateUsername(req.user.sub, dto)
  }
}
