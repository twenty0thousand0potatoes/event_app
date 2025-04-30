import { Injectable } from '@nestjs/common';
import { join } from 'path';
import {Response} from 'express'

@Injectable()
export class AppService {
  sendIndexFile(res: Response): void {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}
