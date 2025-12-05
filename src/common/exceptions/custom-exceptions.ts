import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción para cuando un recurso no se encuentra
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resourceName: string, identifier?: string | number) {
    const message = identifier
      ? `${resourceName} con ID "${identifier}" no encontrado`
      : `${resourceName} no encontrado`;
    
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Resource Not Found',
        message,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Excepción para reglas de negocio violadas
 */
export class BusinessRuleException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Business Rule Violation',
        message,
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Excepción para recursos duplicados
 */
export class DuplicateResourceException extends HttpException {
  constructor(resourceName: string, field?: string) {
    const message = field
      ? `Ya existe un ${resourceName} con ese ${field}`
      : `El ${resourceName} ya existe`;
    
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'Duplicate Resource',
        message,
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Excepción para operaciones no permitidas
 */
export class OperationNotAllowedException extends HttpException {
  constructor(message: string, reason?: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Operation Not Allowed',
        message,
        details: reason ? { reason } : undefined,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Excepción para límites excedidos
 */
export class LimitExceededException extends HttpException {
  constructor(resourceName: string, limit: number, current?: number) {
    const message = current !== undefined
      ? `Límite de ${resourceName} excedido: ${current}/${limit}`
      : `Límite máximo de ${resourceName} alcanzado (${limit})`;
    
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Limit Exceeded',
        message,
        details: { limit, current },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Excepción para validación de datos inválidos
 */
export class InvalidDataException extends HttpException {
  constructor(message: string, fields?: string[]) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Invalid Data',
        message,
        details: fields ? { invalidFields: fields } : undefined,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * Excepción para estados inválidos
 */
export class InvalidStateException extends HttpException {
  constructor(resourceName: string, currentState: string, requiredState?: string) {
    const message = requiredState
      ? `${resourceName} está en estado "${currentState}", se requiere estado "${requiredState}"`
      : `Estado inválido "${currentState}" para ${resourceName}`;
    
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'Invalid State',
        message,
        details: { currentState, requiredState },
      },
      HttpStatus.CONFLICT,
    );
  }
}
