/**
 * Excepción personalizada para errores de lógica de negocio
 */
export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'BusinessException';
  }
}

/**
 * Excepción para recursos no encontrados
 */
export class NotFoundException extends BusinessException {
  constructor(resource: string, id: string) {
    super(`${resource} con id ${id} no encontrado`, 'NOT_FOUND', 404);
    this.name = 'NotFoundException';
  }
}

/**
 * Excepción para acceso no autorizado
 */
export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Acceso no autorizado') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedException';
  }
}

/**
 * Excepción para acceso prohibido
 */
export class ForbiddenException extends BusinessException {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenException';
  }
}

/**
 * Excepción para errores de validación
 */
export class ValidationException extends BusinessException {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]>,
  ) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationException';
  }
}
