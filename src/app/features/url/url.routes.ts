import { Routes } from "@angular/router";
import { UrlListPage } from "@features/url/pages/url-list-page/url-list-page";
import { UrlFormPage } from "./pages/url-form-page/url-form-page";

export const URL_ROUTES: Routes = [
  {
    path: '',
    component: UrlListPage
  },
  {
    path: 'form',
    component: UrlFormPage
  }
]