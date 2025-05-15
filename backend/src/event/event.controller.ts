import { Controller, Get, Query, Post, Body, UseGuards, Req, Param, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
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
  ): Promise<Event[]> {
    const filters = {
      type,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
    };
    return this.eventService.findEvents(filters);
  }

  @Get(':id')
  async getEventById(@Param('id') id: string): Promise<Event> {
    return this.eventService.getEventById(Number(id));
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
