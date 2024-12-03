import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway(Number(process.env.WEBSOCKET_PORT))
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private connectedUsers = new Map<number, Socket>();

  constructor(
    private readonly notificationsService: NotificationsService,
    private jwtService: JwtService,
  ) {}

  private async indentifyUser(client: Socket) {
    const { token } = client.handshake.auth;
    if (!token) throw new UnauthorizedException();

    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.indentifyUser(client);

      this.connectedUsers.set(user.sub, client);

      this.logger.verbose(`User connected: ${user.sub}`);
    } catch (error) {
      console.error('Connection failed:', error.message);
      client.disconnect();
    }
  }
  async handleDisconnect(client: any) {
    const { token } = client.handshake.auth;
    if (!token) throw new UnauthorizedException();

    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });

    this.connectedUsers.delete(payload.sub);
  }

  @SubscribeMessage('notificate')
  async handleEvent(
    @MessageBody() { message, userId }: { message: string; userId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const receiverSocket = this.connectedUsers.get(userId);

    const sender = await this.indentifyUser(client);

    if (!receiverSocket) {
      this.logger.error(`No connected socket for userId: ${userId}`);
      return 'Error: User not connected';
    }

    receiverSocket.send({ message, from: sender.email });
    return message;
  }

  logger = new Logger('NotificationsGateway');
}
