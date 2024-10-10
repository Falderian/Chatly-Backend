import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class Decorators {
  static UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user?.sub;
    },
  );
}
