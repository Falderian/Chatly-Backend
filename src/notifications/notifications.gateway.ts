import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT))
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly notificationsService: NotificationsService) {}

  async handleConnection(client: Socket) {
    console.log('connection attempt');

    return await this.notificationsService.handleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    return await this.notificationsService.handleDisconnect(client);
  }
}
