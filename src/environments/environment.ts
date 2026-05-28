// Load API key from config.json fetched at startup
// See src/main.ts for how config is loaded
declare global {
  interface Window {
    __APP_CONFIG__?: { weatherApiKey: string };
  }
}

export const environment = {
  weatherApiKey: (window as any).__APP_CONFIG__?.weatherApiKey || ''
};
