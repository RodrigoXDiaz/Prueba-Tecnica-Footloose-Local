import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';

/**
 * Filtro Global de Excepciones
 * Captura y formatea todas las excepciones con respuesta uniforme
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let errors: any = null;

    if (exception instanceof BusinessException) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
      
      if ('errors' in exception) {
        errors = (exception as any).errors;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `Status: ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
