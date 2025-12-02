import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas públicas (sin autenticación)
 * Uso: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
