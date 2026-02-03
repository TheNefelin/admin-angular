import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpStatusCode,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

/** Tipo mínimo del body para detectar respuestas envueltas en ApiResponseModel */
function isApiResponseBody(body: unknown): body is { isSuccess: boolean; message?: string; statusCode?: number } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'isSuccess' in body &&
    typeof (body as { isSuccess: unknown }).isSuccess === 'boolean'
  );
}

/**
 * Interceptor que:
 * 1. Convierte respuestas 2xx con isSuccess: false en error (unifica flujo de errores de negocio).
 * 2. Muestra notificación global para cualquier error (red o negocio).
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    switchMap((event) => {
      if (!(event instanceof HttpResponse)) return of(event);
      const body = event.body;
      if (!isApiResponseBody(body) || body.isSuccess) return of(event);

      const message = body.message ?? 'Error al procesar la solicitud';
      const statusCode = body.statusCode ?? HttpStatusCode.BadRequest;
      notification.showError(message);
      return throwError(
        () =>
          new HttpErrorResponse({
            error: body,
            status: statusCode,
          })
      );
    }),
    catchError((err: unknown) => {
      const message =
        err instanceof HttpErrorResponse
          ? (err.error?.message ?? err.message) || 'Error de conexión'
          : err instanceof Error
            ? err.message
            : 'Error inesperado';
      notification.showError(message);
      return throwError(() => err);
    })
  );
};
