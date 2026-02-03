import { Injectable, signal } from '@angular/core';

export interface NotificationState {
  type: 'error' | 'success';
  message: string;
}

/**
 * Servicio global de notificaciones para errores/success de API.
 * Usado por el interceptor y opcionalmente por componentes.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /** Estado actual: null = cerrado, { type, message } = mostrar dialog */
  readonly current = signal<NotificationState | null>(null);

  showError(message: string): void {
    this.current.set({ type: 'error', message });
  }

  showSuccess(message: string): void {
    this.current.set({ type: 'success', message });
  }

  close(): void {
    this.current.set(null);
  }
}
