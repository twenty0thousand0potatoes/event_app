import { Controller, Get, Patch, Body, Req, UseGuards, UnauthorizedException, Request, ForbiddenException, Post, Delete, Param, UseInterceptors, UploadedFile } from '@nestjs/common'
import { UsersService } from './users.service'
import { Roles } from 'src/auth/roles.decorator'
import { Roles as Role } from '../auth/roles.enum'
import { UpdateUsernameDto } from '../auth/dto/update-username.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/roles.guard'
import { AddHobbyDto } from 'src/auth/dto/add-hobby.dto'
import { UpdateAvatarDto } from 'src/auth/dto/update-avatar.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import { extname } from 'path'

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
      role: user.role,
      avatar: user.avatar
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


  @Post('me/hobbies')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
  async addHobbies(@Request() req, @Body() dto: AddHobbyDto) {
    const userId = req.user.sub;
    return this.usersService.addHobbies(userId, dto.hobbyNames);
  }

  @Get('me/hobbies')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
  async getUserHobbies(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.getUserHobbies(userId);
  }

  @Delete('me/hobbies/:hobbyId')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
  async removeHobby(@Request() req, @Param('hobbyId') hobbyId: number) {
    const userId = req.user.sub;
    return this.usersService.removeHobby(userId, hobbyId);
  }

  @Patch('me/avatar') 
  async updateAvatar(@Req() req, @Body() dto: UpdateAvatarDto) {
    return this.usersService.updateAvatar(req.user.sub, dto);
  }

  @Patch('me/avatar/upload') 
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}`);
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, 
  }))
  async uploadAvatar(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new ForbiddenException('Файл не загружен');
    }
    return this.usersService.uploadAvatar(req.user.sub, file.filename);
  }


}
