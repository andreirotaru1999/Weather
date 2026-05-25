import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ForecastComponent } from './forecast';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

// Create a mock localStorage
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

describe('ForecastComponent', () => {
  let component: ForecastComponent;

  beforeEach(async () => {
    // Mock localStorage before setting up TestBed
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
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    component = TestBed.createComponent(ForecastComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert 32°F to 0°C', () => {
    const result = component['convertToCelsius'](32);
    expect(result).toBe(0);
  });

  it('should convert 212°F to 100°C', () => {
    const result = component['convertToCelsius'](212);
    expect(result).toBe(100);
  });

  it('should initialize city signal as empty string', () => {
    expect(component['city']()).toBe('');
  });

  it('should initialize unit signal as Fahrenheit', () => {
    expect(component['unit']()).toBe('F');
  });
});
