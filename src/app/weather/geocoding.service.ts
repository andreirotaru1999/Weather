import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { CitySuggestion } from './weather.model';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);
  private apiUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  getSuggestions(query: string): Observable<CitySuggestion[]> {
    return this.http
      .get<{ results?: CitySuggestion[] }>(this.apiUrl, {
        params: { name: query, count: '5' }
      })
      .pipe(
        map(response => response.results ?? []),
        catchError(() => of([]))
      );
  }
}
