import { Routes } from '@angular/router';
import { NotFound } from '@features/not-found/not-found';
import { Test } from '@features/test/test';
import { MainLayout } from '@layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadChildren: () => import('@features/home/home.routes').then(m => m.HOME_ROUTES),
      },
      {
        path: 'url-grp',
        loadChildren: () => import('@features/url-grp/url-grp.routes').then(m => m.URL_GRP_ROUTES),
      },
      {
        path: 'url',
        loadChildren: () => import('@features/url/url.routes').then(m => m.URL_ROUTES),
      },
      {
        path: 'test',
        component: Test,
      },
    ]   
  },
  {
    path: '**',
    component: NotFound,
  }
];
