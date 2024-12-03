import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class NotificationsService {
  private connectedUsers = new Map<number, Socket>();

  constructor(private jwtService: JwtService) {}

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

  async notificateUser({
    message,
    senderId,
    receiverId,
  }: {
    message: string;
    senderId: number;
    receiverId: number;
  }): Promise<string> {
    const receiverSocket = this.connectedUsers.get(receiverId);

    if (!receiverSocket) {
      this.logger.error(`No connected socket for userId: ${receiverId}`);
      return 'Error: User not connected';
    }

    receiverSocket.send({ message, from: senderId });
    return message;
  }

  logger = new Logger('NotificationsGateway');
}
