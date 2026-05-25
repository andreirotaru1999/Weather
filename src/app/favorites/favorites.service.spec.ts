import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

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

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    // Mock localStorage before service instantiation
    const mockStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [FavoritesService]
    });

    service = TestBed.inject(FavoritesService);
  });

  afterEach(() => {
    // Clean up mock localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle favorite on', () => {
    service.toggle('Paris');
    expect(service.isFavorite('Paris')).toBe(true);
  });

  it('should toggle favorite off', () => {
    service.toggle('Paris');
    service.toggle('Paris');
    expect(service.isFavorite('Paris')).toBe(false);
  });

  it('should add favorite', () => {
    service.add('Paris');
    expect(service.isFavorite('Paris')).toBe(true);
  });

  it('should remove favorite', () => {
    service.add('Paris');
    service.remove('Paris');
    expect(service.isFavorite('Paris')).toBe(false);
  });

  it('should persist favorites to localStorage', () => {
    return new Promise<void>((resolve) => {
      service.add('Paris');
      setTimeout(() => {
        const stored = JSON.parse(window.localStorage.getItem('favorites') || '[]');
        expect(stored).toContain('Paris');
        resolve();
      }, 0);
    });
  });

  it('should load favorites from localStorage on init', () => {
    window.localStorage.setItem('favorites', JSON.stringify(['London', 'Tokyo']));

    // Create a new service instance to test loading from storage
    TestBed.resetTestingModule();
    
    const mockStorage = createMockLocalStorage();
    mockStorage.setItem('favorites', JSON.stringify(['London', 'Tokyo']));
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [FavoritesService]
    });

    const newService = TestBed.inject(FavoritesService);
    expect(newService.isFavorite('London')).toBe(true);
    expect(newService.isFavorite('Tokyo')).toBe(true);
  });
});
