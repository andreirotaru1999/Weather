import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Fetch configuration before bootstrapping the app
fetch('/config.json')
  .then((response) => response.json())
  .then((config) => {
    // Store config globally so environment.ts can access it
    (window as any).__APP_CONFIG__ = config;

    // Now bootstrap the app
    bootstrapApplication(App, appConfig).catch((err) =>
      console.error('Failed to bootstrap app:', err)
    );
  })
  .catch((err) => {
    console.warn('Failed to load config.json:', err);
    // Bootstrap anyway with empty key (graceful fallback)
    (window as any).__APP_CONFIG__ = { weatherApiKey: '' };
    bootstrapApplication(App, appConfig).catch((err) =>
      console.error('Failed to bootstrap app:', err)
    );
  });
