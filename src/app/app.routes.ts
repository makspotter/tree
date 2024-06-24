import { Routes } from '@angular/router';
import { MAIN_ROUTES } from '@constants';

export const routes: Routes = [
  {
    path: MAIN_ROUTES.LIST,
    loadComponent: () =>
      import('./pages/page-list/page-list.component').then(page => page.PageListComponent),
  },
  {
    path: MAIN_ROUTES.EMPTY,
    redirectTo: MAIN_ROUTES.LIST,
    pathMatch: 'full',
  },
];
