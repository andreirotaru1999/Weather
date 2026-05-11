import { effect, Injectable, signal } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
    favorites = signal<string[]>(
        JSON.parse(localStorage.getItem('favorites') ?? '[]')
    )
    constructor() {
        effect(() => {
            localStorage.setItem('favorites', JSON.stringify(this.favorites()));
        });
    }
    toggle(city: string) {
        this.favorites.update(favs =>
            favs.includes(city) ? favs.filter(f => f !== city) : [...favs, city]
        );
    }

    add(city: string) {
        this.favorites.update(favs => [...favs, city]);
    }

    remove(city: string) {
        this.favorites.update(favs => favs.filter(f => f !== city));
    }

    isFavorite(city: string) {
        return this.favorites().includes(city);
    }

}