import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message =
          (exceptionResponse as Record<string, unknown>).message as string;
        errors = (exceptionResponse as Record<string, unknown>).errors;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: Record<string, unknown> = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    this.logger.error(
      `${message}`,
      exception instanceof Error ? exception.stack : '',
      'HttpExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }
}