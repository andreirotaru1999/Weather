import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WeatherForecast } from './weather.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

  getWeather(city: string): Observable<WeatherForecast> {
    // Read API key at request time (after config.json is loaded)
    const apiKey = (window as any).__APP_CONFIG__?.weatherApiKey || environment.weatherApiKey || '';

    const url = `${this.apiUrl}/${encodeURIComponent(city)}`;
    const params = {
      key: apiKey,
      include: 'days'
    };

    return this.http.get<any>(url, { params }).pipe(
      map(data => ({
        city: data.address,
        days: data.days.map((day: any) => ({
          date: day.datetime,
          temp: day.temp,
          tempMin: day.tempmin,
          tempMax: day.tempmax,
          description: day.description,
          humidity: day.humidity,
          windSpeed: day.windspeed,
          precipProbability: day.precipprob
        }))
      }))
    );
  }
}
