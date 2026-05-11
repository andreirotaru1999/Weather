import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { WeatherService } from '../weather/weather.service';
import { WeatherForecast } from '../weather/weather.model';
import { FavoritesService } from '../favorites/favorites.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forecast',
  standalone: true,
  templateUrl: './forecast.html',
  styleUrl: './forecast.css'
})
export class ForecastComponent implements OnInit {
  private weatherService = inject(WeatherService);
  private favoritesService = inject(FavoritesService);
  private route = inject(ActivatedRoute);

  // Core state signals
  protected city = signal('');
  protected forecast = signal<WeatherForecast | null>(null);
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);
  protected unit = signal<'C' | 'F'>('F');
  protected visibleDays = signal(7);

  // Derived state (computed, not signal)
  protected hasError = computed(() => this.error() !== null);
  protected convertedForecast = computed(() => {
    const forecast = this.forecast();
    if(!forecast || this.unit() === 'F') return forecast;

    return {
      ...forecast,
      days: forecast.days.map(day => ({
        ...day,
        temp: this.convertToCelsius(day.temp),
        tempMax: this.convertToCelsius(day.tempMax),
        tempMin: this.convertToCelsius(day.tempMin)
      }))
    }
  })
  protected visibleForecast = computed(() => {
     const forecast = this.convertedForecast();
     if(!forecast) return null;

     return {
      ...forecast,
      days: forecast.days.slice(0, this.visibleDays())
     }
  })

  protected isFavorite = computed(() => {
    const f = this.forecast();
    return f ? this.favoritesService.isFavorite(f.city) : false;
  });

  protected toggleFavorite(city: string) {
    this.favoritesService.toggle(city);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['city']) {
        this.city.set(params['city']);
        this.search();
      }
    });
  }

  protected search() {
    const cityName = this.city().trim();
    if (!cityName) {
      this.error.set('Please enter a city name');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.forecast.set(null);

    this.weatherService.getWeather(cityName).subscribe({
      next: (data: WeatherForecast) => {
        this.forecast.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Weather API error:', err);
        this.error.set(err.error?.message || 'City not found or API error');
        this.isLoading.set(false);
      }
    });
  }

  protected convertToCelsius(fahrenheit: number): number {
    return Math.round((fahrenheit - 32) * 5 / 9);
  }
}
