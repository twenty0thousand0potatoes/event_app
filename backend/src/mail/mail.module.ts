import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports:[
        ConfigModule.forRoot(),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              transport: {
                host: config.get<string>('MAIL_HOST'),
                port: config.get<number>('MAIL_PORT'),
                secure: config.get<boolean>('MAIL_SECURE'), 
                auth: {
                  user: config.get<string>('MAIL_USER'),
                  pass: config.get<string>('MAIL_PASS'),
                },
              },
              defaults: {
                from: config.get<string>('MAIL_FROM'),
              },
            }),
          }),
    ],
    providers: [MailService],
    exports:[MailService]
})
export class MailModule {}
