import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WeatherService } from './weather.service';
import { environment } from '../../environments/environment';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        WeatherService
      ]
    });

    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have getWeather method', () => {
    expect(typeof service.getWeather).toBe('function');
  });

  it('should fetch weather data and transform it', () => {
    return new Promise<void>((resolve) => {
      const cityName = 'Paris';
      const mockResponse = {
        address: 'Paris, France',
        days: [
          {
            datetime: '2026-05-21',
            temp: 72,
            tempmin: 60,
            tempmax: 80,
            description: 'Sunny',
            humidity: 65,
            windspeed: 10,
            precipprob: 5
          }
        ]
      };

      service.getWeather(cityName).subscribe(result => {
        expect(result.city).toBe('Paris, France');
        expect(result.days.length).toBe(1);
        expect(result.days[0].temp).toBe(72);
        expect(result.days[0].tempMin).toBe(60);
        expect(result.days[0].tempMax).toBe(80);
        resolve();
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('timeline') &&
        req.url.includes('Paris') &&
        req.params.get('key') === environment.weatherApiKey
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  it('should handle API errors', () => {
    return new Promise<void>((resolve) => {
      const cityName = 'InvalidCity';

      service.getWeather(cityName).subscribe({
        next: () => {},
        error: (error) => {
          expect(error.status).toBe(404);
          resolve();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('InvalidCity'));
      req.flush('City not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
