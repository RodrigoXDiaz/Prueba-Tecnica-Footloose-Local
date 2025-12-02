import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@core/interfaces/auth.interface';

/**
 * Decorador para obtener el usuario actual del request
 * Uso: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
