import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { HobbyService } from './hobby.service'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'

@Controller('hobbies')
@UseGuards(JwtAuthGuard) 
export class HobbyController {
  constructor(private readonly hobbiesService: HobbyService) {}

  @Get()
  findAll() {
    return this.hobbiesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hobbiesService.findOne(id)
  }
}
