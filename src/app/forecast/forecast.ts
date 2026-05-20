import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { WeatherService } from '../weather/weather.service';
import { GeocodingService } from '../weather/geocoding.service';
import { WeatherForecast, CitySuggestion } from '../weather/weather.model';
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
  private geocodingService = inject(GeocodingService);
  private favoritesService = inject(FavoritesService);
  private route = inject(ActivatedRoute);

  protected city = signal('');
  protected forecast = signal<WeatherForecast | null>(null);
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);
  protected unit = signal<'C' | 'F'>('F');
  protected visibleDays = signal(7);
  protected autoRefresh = signal(false);
  protected refreshInterval = signal(60);
  private intervalId = signal<ReturnType<typeof setInterval> | null>(null);

  protected suggestions = signal<CitySuggestion[]>([]);
  protected showDropdown = signal(false);
  protected isSuggestionsLoading = signal(false);

  private inputSubject = new Subject<string>();

  constructor() {
    effect(() => {
      // Clear any existing interval
      if (this.intervalId()) {
        clearInterval(this.intervalId()!);
        this.intervalId.set(null);
      }

      // Start new interval only if auto-refresh is on AND we have a forecast
      if (this.autoRefresh() && this.forecast()) {
        const id = setInterval(() => {
          this.search();
        }, this.refreshInterval() * 1000);
        this.intervalId.set(id as any);
      }
    });

    // RxJS pipeline for city autocomplete
    this.inputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(query => query.length >= 2),
      switchMap(query => {
        this.isSuggestionsLoading.set(true);
        return this.geocodingService.getSuggestions(query);
      }),
      takeUntilDestroyed()
    ).subscribe(results => {
      this.suggestions.set(results);
      this.showDropdown.set(results.length > 0);
      this.isSuggestionsLoading.set(false);
    });
  }

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

  protected onInput(value: string): void {
    this.city.set(value);
    if (value.length < 2) this.closeSuggestions();
    this.inputSubject.next(value);
  }

  protected selectSuggestion(suggestion: CitySuggestion): void {
    this.city.set(this.formatSuggestion(suggestion));
    this.closeSuggestions();
    this.search();
  }

  protected formatSuggestion(s: CitySuggestion): string {
    return [s.name, s.admin1, s.country].filter(Boolean).join(', ');
  }

  protected closeSuggestions(): void {
    this.showDropdown.set(false);
    this.suggestions.set([]);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeSuggestions();
    if (event.key === 'Enter') {
      this.closeSuggestions();
      this.search();
    }
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

  ngOnDestroy() {
  if (this.intervalId()) {
    clearInterval(this.intervalId() ?? undefined);
  }
}
}
