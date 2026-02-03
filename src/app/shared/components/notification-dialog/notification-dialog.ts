import { Component, inject } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  templateUrl: './notification-dialog.html',
})
export class NotificationDialogComponent {
  protected readonly notification = inject(NotificationService);
}
