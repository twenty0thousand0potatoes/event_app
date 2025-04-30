import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor (private readonly mailerService:MailerService){}

    async sendEmail(to: string, subject: string, text: string, html?: string) {
        try {
          const info = await this.mailerService.sendMail({
            to,
            subject,
            text,
            html,
          });
          console.log('✅ Email sent:', info);
          return info;
        } catch (error) {
          console.error('❌ Error sending email:', error); 
          throw error;
        }
      }
}
