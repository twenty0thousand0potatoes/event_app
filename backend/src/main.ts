import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'),{
    index:false
  });

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true
  })
  await app.listen(3000);
}
bootstrap();
 