import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAVIGATION_ROUTES } from '@shared/constants/navigation-routes-constant';

@Component({
  selector: 'app-not-found',
  imports: [
    RouterLink,
  ],
  templateUrl: './not-found.html',
})
export class NotFound {
  home = NAVIGATION_ROUTES.HOME.URI;
}
