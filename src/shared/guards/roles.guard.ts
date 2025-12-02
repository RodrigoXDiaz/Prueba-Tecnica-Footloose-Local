import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@core/interfaces/auth.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenException } from '@core/exceptions/business.exception';

/**
 * Guard de Roles
 * Verifica que el usuario tenga los roles necesarios para acceder a una ruta
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
