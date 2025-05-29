import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToNotifications')
  handleSubscribe(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // Here you can handle subscription logic, e.g., join rooms based on user ID
    console.log(`Client ${client.id} subscribed to notifications with data:`, data);
  }

  sendNotificationToUser(userId: number, notification: any) {
    // Emit notification to the specific user room or client
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
