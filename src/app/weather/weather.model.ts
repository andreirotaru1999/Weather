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
