import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import {Response} from 'express'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHomePage(@Res() res: Response) {
    res.redirect(301, 'http://localhost:3001');
  }
}
   