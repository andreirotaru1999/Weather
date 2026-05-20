export interface DayForecast {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  humidity: number;
  windSpeed: number;
  precipProbability: number;
}

export interface WeatherForecast {
  city: string;
  days: DayForecast[];
}

export interface CitySuggestion {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  admin1?: string; // region/state — absent for some locations
}