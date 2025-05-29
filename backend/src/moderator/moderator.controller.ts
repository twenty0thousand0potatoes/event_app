import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/auth/roles.decorator'
import { Roles as Role } from '../auth/roles.enum'
import { RoleChangeRequestStatus } from '../users/role-change-request.entity';
import { UsersService } from '../users/users.service';
import { EventService } from '../event/event.service';


@Controller('moderator')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(Role.MODERATOR)
export class ModeratorController {
  constructor(
    private readonly moderatorService: ModeratorService,
    private readonly usersService: UsersService,
    private readonly eventService: EventService,
  ) {}

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
   
    return this.moderatorService.getUsers({
      search,
      city,
      role,
      sortBy,
      sortOrder,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Get('events')
  async getEvents(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.moderatorService.getEvents({
      search,
      type,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      sortBy,
      sortOrder,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('events/:id')
  async getEventById(@Param('id') id: number) {
    return this.eventService.getEventById(id);
  }

  @Get('role-change-requests')
  async getRoleChangeRequests() {
    return this.moderatorService.getPendingRoleChangeRequests();
  }

  @Post('role-change-requests/:id/approve')
  async approveRoleChangeRequest(
    @Param('id') id: number,
    @Body('comment') comment?: string,
  ) {
    return this.moderatorService.updateRoleChangeRequestStatus(
      id,
      RoleChangeRequestStatus.APPROVED,
      comment,
    );
  }

  @Post('role-change-requests/:id/reject')
  async rejectRoleChangeRequest(
    @Param('id') id: number,
    @Body('comment') comment?: string,
  ) {
    return this.moderatorService.updateRoleChangeRequestStatus(
      id,
      RoleChangeRequestStatus.REJECTED,
      comment,
    );
  }
}

 