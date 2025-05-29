import { Controller, Get, Query, Post, Body, UseGuards, Req, Param, UseInterceptors, UploadedFile, UploadedFiles, Put, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Roles as Role } from '../auth/roles.enum';
import { Request } from 'express';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateEventDto } from '../auth/dto/create-event.dto';
import { UpdateEventDto } from '../auth/dto/update-event.dto';
import { User } from 'src/users/user.entity';
import { ignoreElements } from 'rxjs';


@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getEvents(
    @Query('type') type?: string, 
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: 'date' | 'price',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Event[]> {
    const filters = {
      type,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
    };
    const limitNum = limit ? parseInt(limit) : undefined;
    const offsetNum = offset ? parseInt(offset) : undefined;
    return this.eventService.findEvents(filters, limitNum, offsetNum);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async getMyEvents(@Req() req: Request): Promise<{ createdEvents: Event[]; subscribedEvents: Event[] }> {
    const user = req.user as any;
    const createdEvents = await this.eventService.getEventsCreatedByUser(user.sub);
    const subscribedEvents = await this.eventService.getEventsSubscribedByUser(user.sub);
    return { createdEvents, subscribedEvents };
  }

  @Get('mine/visited')
  @UseGuards(JwtAuthGuard)
  async getMyVisitedEvents(@Req() req: Request): Promise<Event[]> {
    const user = req.user as any;
    return this.eventService.getEndedSubscribedEvents(user.sub);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string): Promise<Event> {
    return this.eventService.getEventById(Number(id));
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  async subscribeToEvent(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.eventService.subscribeToEvent(user.sub, Number(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: Request,
  ): Promise<Event> {
    const user = req.user as any;
    const event = await this.eventService.getEventById(Number(id));
    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    if (event.creator.id !== user.sub) {
      throw new ForbiddenException('Нет прав на редактирование этого мероприятия');
    }
    return this.eventService.updateEvent(Number(id), updateEventDto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<{ url: string }> {
    return { url: `/uploads/${file.filename}` };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  async createEvent(
    @Body() eventData: CreateEventDto,
    @Req() req: Request,
  ): Promise<Event> {
    const user = req.user;
    return this.eventService.createEvent(eventData, user);
  }

  @Get('all')
  async getAllEventsWithCreators(): Promise<Event[]> {
    return this.eventService.getAllEventsWithCreators();
  }
}
