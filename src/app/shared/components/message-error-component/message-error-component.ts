import { Component, input } from '@angular/core';

@Component({
  selector: 'app-message-error-component',
  standalone: true,
  templateUrl: './message-error-component.html',
})
export class MessageErrorComponent {
  message = input.required<string>();
}
