import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationDialogComponent } from '@shared/components/notification-dialog/notification-dialog';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    NotificationDialogComponent
  ],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('admin-angular');
}
