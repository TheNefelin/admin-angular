import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";
import { NAVIGATION_DASHBOARD } from '@shared/constants/navigation-dashboard-constant';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  protected readonly navigationItems = NAVIGATION_DASHBOARD;
}
