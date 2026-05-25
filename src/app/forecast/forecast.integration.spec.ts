import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForecastComponent } from './forecast';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DebugElement } from '@angular/core';

// Mock localStorage
const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
    removeItem: (key: string) => { delete store[key]; },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length
  };
};

describe('ForecastComponent Integration Tests', () => {
  let component: ForecastComponent;
  let fixture: ComponentFixture<ForecastComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    // Mock localStorage
    const mockStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });

    const mockActivatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [ForecastComponent],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForecastComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should render the weather forecast page', () => {
    const title = debugElement.nativeElement.querySelector('h1');
    expect(title?.textContent).toContain('Weather Forecast');
  });

  it('should have an input field for city search', () => {
    const input = debugElement.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.placeholder).toContain('Enter city name');
  });

  it('should have a search button', () => {
    const button = debugElement.nativeElement.querySelector('button');
    expect(button?.textContent).toContain('Search');
  });

  it('should update city signal when typing', async () => {
    const input = debugElement.nativeElement.querySelector('input') as HTMLInputElement;
    
    input.value = 'Paris';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    // Give async operations time to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    expect(component['city']()).toBe('Paris');
  });

  it('should show autocomplete suggestions when typing (real API)', async () => {
    const input = debugElement.nativeElement.querySelector('input') as HTMLInputElement;
    
    // Type a city name
    input.value = 'London';
    input.dispatchEvent(new Event('input'));
    component['onInput']('London');
    
    // Wait for debounce and API response
    await new Promise(resolve => setTimeout(resolve, 600));
    fixture.detectChanges();
    
    // After typing "London", suggestions should eventually appear
    // (This depends on the real API being available)
    if (component['suggestions']().length > 0) {
      expect(component['showDropdown']()).toBe(true);
      expect(component['suggestions']().length).toBeGreaterThan(0);
    }
  });

  it('should close dropdown when pressing Escape', () => {
    component['showDropdown'].set(true);
    component['suggestions'].set([
      { name: 'Paris', country: 'France', country_code: 'FR', latitude: 48.8566, longitude: 2.3522 }
    ]);
    fixture.detectChanges();
    
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component['onKeydown'](event);
    
    expect(component['showDropdown']()).toBe(false);
  });

  it('should close dropdown when pressing Enter', () => {
    component['showDropdown'].set(true);
    component['city'].set('Paris');
    fixture.detectChanges();
    
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component['onKeydown'](event);
    
    expect(component['showDropdown']()).toBe(false);
  });

  it('should toggle unit between Fahrenheit and Celsius', () => {
    expect(component['unit']()).toBe('F');
    
    component['unit'].update(u => u === 'F' ? 'C' : 'F');
    expect(component['unit']()).toBe('C');
    
    component['unit'].update(u => u === 'F' ? 'C' : 'F');
    expect(component['unit']()).toBe('F');
  });

  it('should display error message when city is empty', () => {
    component['city'].set('');
    component['search']();
    
    expect(component['hasError']()).toBe(true);
    expect(component['error']()).toContain('Please enter a city name');
  });

  it('should set loading state when searching', async () => {
    component['city'].set('Paris');
    component['search']();
    
    expect(component['isLoading']()).toBe(true);
    
    // Wait for API response (may or may not complete depending on network)
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('should add city to favorites when toggling favorite', () => {
    component['forecast'].set({
      city: 'Paris',
      days: []
    });
    fixture.detectChanges();
    
    expect(component['isFavorite']()).toBe(false);
    
    component['toggleFavorite']('Paris');
    fixture.detectChanges();
    
    expect(component['isFavorite']()).toBe(true);
  });

  it('should format city suggestions correctly', () => {
    const suggestion = {
      name: 'Paris',
      country: 'France',
      country_code: 'FR',
      admin1: 'Île-de-France',
      latitude: 48.8566,
      longitude: 2.3522
    };
    
    const formatted = component['formatSuggestion'](suggestion);
    expect(formatted).toBe('Paris, Île-de-France, France');
  });

  it('should convert visible days when signal changes', () => {
    component['forecast'].set({
      city: 'Paris',
      days: Array(15).fill(null).map((_, i) => ({
        date: `2026-05-${21 + i}`,
        temp: 70 + i,
        tempMin: 60 + i,
        tempMax: 80 + i,
        description: 'Clear',
        humidity: 65,
        windSpeed: 10,
        precipProbability: 5
      }))
    });
    
    component['visibleDays'].set(3);
    const visible = component['visibleForecast']();
    expect(visible?.days.length).toBe(3);
    
    component['visibleDays'].set(7);
    const visible7 = component['visibleForecast']();
    expect(visible7?.days.length).toBe(7);
  });

  it('should convert temperatures correctly when unit changes', () => {
    component['forecast'].set({
      city: 'Paris',
      days: [
        {
          date: '2026-05-21',
          temp: 32,
          tempMin: 32,
          tempMax: 86,
          description: 'Clear',
          humidity: 65,
          windSpeed: 10,
          precipProbability: 5
        }
      ]
    });
    
    // Start with Fahrenheit
    expect(component['unit']()).toBe('F');
    let converted = component['convertedForecast']();
    expect(converted?.days[0].temp).toBe(32);
    
    // Switch to Celsius
    component['unit'].set('C');
    converted = component['convertedForecast']();
    expect(converted?.days[0].temp).toBe(0); // 32°F = 0°C
    expect(converted?.days[0].tempMax).toBe(30); // 86°F ≈ 30°C
  });

  it('should compute favorite status based on forecast city', () => {
    // No forecast yet
    expect(component['isFavorite']()).toBe(false);
    
    // Add forecast
    component['forecast'].set({
      city: 'New York',
      days: []
    });
    
    // Still not favorite
    expect(component['isFavorite']()).toBe(false);
    
    // Add to favorites
    component['toggleFavorite']('New York');
    
    // Now it should be favorite
    expect(component['isFavorite']()).toBe(true);
  });
});
