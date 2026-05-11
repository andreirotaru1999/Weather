import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesService } from '../favorites.service';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  templateUrl: './favoritesListComponent.html',
  styleUrl: './favoritesListComponent.css'
})
export class FavoritesListComponent {
    private favoritesService = inject(FavoritesService);
    private router = inject(Router);

    protected favorites = this.favoritesService.favorites;
    protected city = signal('');

    protected addToFavorites() {
      this.favoritesService.add(this.city());
    }
    protected removeFromFavorites(city: string) {
      this.favoritesService.remove(city);
    }
    protected viewForecast(city: string) {
      this.router.navigate(['/'], { queryParams: { city: city } });
      
    }

}