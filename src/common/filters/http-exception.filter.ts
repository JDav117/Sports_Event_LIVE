import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';
    let error = 'Internal Server Error';
    let details: any = undefined;

    // Manejo de excepciones HTTP de NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || exception.name;
        details = responseObj.details;
      }
    }
    // Manejo de errores de TypeORM
    else if (exception instanceof Error) {
      const errorName = exception.constructor.name;

      // Error de base de datos
      if (errorName.includes('QueryFailedError')) {
        status = HttpStatus.BAD_REQUEST;
        error = 'Database Error';
        message = 'Error en la operación de base de datos';

        // Extraer información útil del error de MySQL
        const dbError = exception as any;
        if (dbError.code === 'ER_DUP_ENTRY') {
          message = 'El registro ya existe en la base de datos';
        } else if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
          message = 'Referencia inválida a otro registro';
        }
      }
      // Error de entidad no encontrada
      else if (errorName.includes('EntityNotFound')) {
        status = HttpStatus.NOT_FOUND;
        error = 'Not Found';
        message = 'El recurso solicitado no existe';
      }
      // Otros errores
      else {
        message = exception.message || message;
        error = errorName;
      }
    }

    // Construir respuesta de error
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Agregar detalles solo si existen
    if (details) {
      errorResponse.details = details;
    }

    // Log del error (solo errores 500 se consideran críticos)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}`,
        JSON.stringify(errorResponse.message),
      );
    }

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }
}
