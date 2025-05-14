import { Controller, Get, Patch, Body, Req, UseGuards, UnauthorizedException, Request, ForbiddenException, Post, Delete, Param, UseInterceptors, UploadedFile } from '@nestjs/common'
import { UsersService } from './users.service'
import { Roles } from 'src/auth/roles.decorator'
import { Roles as Role } from '../auth/roles.enum'
import { UpdateUsernameDto } from '../auth/dto/update-username.dto'
import { UpdateAgeDto } from '../auth/dto/update-age.dto'
import { UpdateCityDto } from '../auth/dto/update-city.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/roles.guard'
import { AddHobbyDto } from 'src/auth/dto/add-hobby.dto'
import { UpdateAvatarDto } from 'src/auth/dto/update-avatar.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import { extname } from 'path'
import { StripeService } from 'src/stripe/stripe.service';

@Controller('users')
@UseGuards(JwtAuthGuard) 
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
  ) {}

  @Get('me')
  async getCurrentUser(@Request() req) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден!');
    }
    
    return {
      sub:user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      age: user.age,
      city: user.city,
      description: user.description,
      isPlusSubscriber: user.isPlusSubscriber,
      plusSubscriptionExpiresAt: user.plusSubscriptionExpiresAt,
    };
  }

  @Post('me/subscribe')
  async createSubscription(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден!');
    }

    const customer = await this.stripeService.createCustomer(user.email);

    const priceId = process.env.STRIPE_PLUS_PRICE_ID;
    if (!priceId) {
      throw new Error('STRIPE_PLUS_PRICE_ID не настроен');
    }

    const subscription = await this.stripeService.createSubscription(customer.id, priceId);
 
    let clientSecret = null;
    if (typeof subscription.latest_invoice !== 'string' && subscription.latest_invoice) {
      // @ts-ignore
      if ('payment_intent' in subscription.latest_invoice && subscription.latest_invoice.payment_intent) {
        // @ts-ignore
        clientSecret = subscription.latest_invoice.payment_intent.client_secret;
      }
    }

    return {
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
    };
  }

  @Get('me/subscription') 
  async getSubscriptionStatus(@Request() req) {
    return this.usersService.getSubscriptionStatus(req.user.sub);
  }

  @Get('me/description')
  async getDescription(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.getDescription(userId);
  }

  @Patch('me/description')
  async updateDescription(@Request() req, @Body('description') description: string) {
    const userId = req.user.sub;
    return this.usersService.updateDescription(userId, description);
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

  @Patch('me/age')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
  async updateOwnAge(@Request() req, @Body() dto: UpdateAgeDto) {
    const userId = req.user.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден!');
    }

    return this.usersService.updateAge(userId, dto.age);
  }

  @Patch('me/city')
  @UseGuards(RolesGuard)
  @Roles(Role.USER, Role.MODERATOR, Role.ADMIN)
  async updateOwnCity(@Request() req, @Body() dto: UpdateCityDto) {
    const userId = req.user.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден!');
    }

    return this.usersService.updateCity(userId, dto.city);
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
