import { Routes } from '@angular/router';
import { ForecastComponent } from './forecast/forecast';
import { LayoutComponent } from './layout/layout';
import { FavoritesListComponent } from './favorites/list/favoritesListComponent';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: ForecastComponent },
      { path: 'favorites', component: FavoritesListComponent }
    ]
  }
];
