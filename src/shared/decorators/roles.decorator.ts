import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@core/interfaces/auth.interface';

export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar roles requeridos en una ruta
 * Uso: @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
