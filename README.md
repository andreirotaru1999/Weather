# 🌤️ Weather Forecast App

A modern **Angular 21** weather application built to practice signals-based reactive
state management, testing strategy, and automated deployment. Built with Angular
Signals, RxJS, Vitest, and a GitHub Actions CI/CD pipeline.

**[🚀 Live Demo](http://weather-app-4859-9470-6982.s3-website-us-east-1.amazonaws.com)**

> **Status:** Personal learning project, in active development. Built to deepen my
> experience with modern Angular (signals, standalone components, new control flow)
> and with AI-assisted development workflows.

---

## ✨ Features

- **City search with autocomplete** — real-time suggestions via the Open-Meteo Geocoding API
- **15-day forecast** — powered by the Visual Crossing Weather API
- **Temperature unit toggle** — switch between Celsius and Fahrenheit
- **Favorites** — save cities, persisted in localStorage
- **Auto-refresh** — configurable refresh interval for live updates
- **Responsive layout** — works across desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer            | Technology              | Why                                                        |
|------------------|-------------------------|------------------------------------------------------------|
| Framework        | Angular 21 (standalone) | Modern, signals-based reactive architecture                |
| Local state      | Angular Signals         | Simpler than RxJS for synchronous component state          |
| Async pipelines  | RxJS                    | Debouncing, request cancellation, event streams            |
| Testing          | Vitest + jsdom          | Fast, lightweight test runner                              |
| Styling          | Tailwind CSS            | Utility-first, responsive                                  |
| Language         | TypeScript (strict)     | Compile-time safety                                        |
| CI/CD            | GitHub Actions          | Automated type-check, build, and test on every push        |
| Hosting          | AWS S3 (static site)    | Simple, cheap static frontend hosting                      |

---

## 🏗️ Architecture

### State management: Signals vs RxJS

The app uses each tool where it fits best.

**Signals** for synchronous local state owned by a component:

```typescript
protected unit = signal<'C' | 'F'>('F');
protected forecast = signal<WeatherForecast | null>(null);
protected suggestions = signal<CitySuggestion[]>([]);
```

**RxJS** for asynchronous event pipelines — here, a debounced city search that
cancels in-flight requests when the user keeps typing:

```typescript
this.inputSubject.pipe(
  debounceTime(300),            // wait until typing pauses
  distinctUntilChanged(),       // ignore unchanged input
  switchMap(query => this.geocoding.search(query)) // cancel previous request
).subscribe(results => this.suggestions.set(results));
```

**Effects** for reactive side effects, such as the auto-refresh interval:

```typescript
effect(() => {
  if (this.autoRefresh() && this.forecast()) {
    const id = setInterval(() => this.search(), this.refreshInterval() * 1000);
    this.intervalId.set(id);
  }
});
```

### Component structure

src/app/
├── forecast/      # Main weather display (signals + @if/@for templates)
├── weather/       # API services (Visual Crossing) + TypeScript models
├── favorites/     # Favorites with localStorage persistence
└── layout/        # Navbar + routing
---

## ✅ Testing

The project includes unit tests (services in isolation, with mocked HTTP and
localStorage) and integration tests (components with real DOM and change detection).

```bash
npm test            # run the test suite
npm test -- --watch # watch mode
```

> Run `npm test` for the current passing count — kept accurate as the project evolves.

---

## 🚀 Deployment

A GitHub Actions workflow runs on every push to `main`/`develop` and on pull requests:
install → type-check → build → test. The production build is deployed to an AWS S3
static website bucket.

---

## 🔧 Local Development

### Prerequisites
- Node.js 20+
- npm 11+
- A free Visual Crossing API key — [get one here](https://www.visualcrossing.com/weather-api)

### Setup
```bash
git clone https://github.com/andreirotaru1999/Weather.git
cd Weather
npm install

# Add your API key to a local .env file (never committed)
echo "VITE_VISUALCROSSING_API_KEY=your_api_key_here" > .env

npm start
# open http://localhost:4200
```

---

## 📚 What I learned

- **Signals vs RxJS** — where signals simplify local state, and where RxJS still wins for async pipelines
- **Standalone components** — dependency injection without NgModules
- **Testing strategy** — unit tests for logic, integration tests for user flows
- **CI/CD & secrets** — automated pipelines and keeping keys out of source control
- **API integration** — multiple external APIs, error handling, request cancellation

