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

      this.logger.verbose(`User connected: ${1}`);
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

  // To Do, check the client notification event
  async notificateUser({
    message,
    senderId,
    receiverId,
  }: {
    message: string;
    senderId: number;
    receiverId: number;
  }): Promise<string> {
    // console.log('sender', senderId);
    // console.log('reciever ', receiverId);
    const receiverSocket = this.connectedUsers.get(receiverId);
    // console.log(this.connectedUsers.size);
    // console.log(this.connectedUsers.keys());
    // console.log(receiverSocket);
    if (!receiverSocket) {
      return `No connected socket for userId: ${receiverId}`;
    }

    // console.log('receiverSocket', receiverSocket);
    receiverSocket.emit('notificate', { message, from: senderId });
    return message;
  }

  logger = new Logger('NotificationsGateway');
}
