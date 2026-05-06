import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherService } from './weather.service';
import { WeatherForecast } from './weather.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private weatherService = inject(WeatherService);

  // Core state signals
  protected city = signal('');
  protected forecast = signal<WeatherForecast | null>(null);
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);

  // Derived state (computed, not signal)
  protected hasResult = computed(() => this.forecast() !== null);
  protected hasError = computed(() => this.error() !== null);

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
}
