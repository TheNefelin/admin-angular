import { Routes } from "@angular/router";
import { UrlGrpListPage } from '@features/url-grp/pages/url-grp-list-page/url-grp-list-page';
import { UrlGrpFormPage } from "./pages/url-grp-form-page/url-grp-form-page";

export const  URL_GRP_ROUTES: Routes = [
  {
    path: '',
    component: UrlGrpListPage
  },
  {
    path: 'form',
    component: UrlGrpFormPage
  }
]