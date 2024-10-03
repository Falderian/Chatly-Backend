import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, _: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;

    const clientIp = req.headers['x-forwarded-for'] || ip;

    this.logger.verbose(`${clientIp} -> ${method} ${originalUrl}`);

    next();
  }
}
