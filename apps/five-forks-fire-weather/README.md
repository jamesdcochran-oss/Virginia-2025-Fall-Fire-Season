# Five Forks Fire Weather - Mobile App

A React Native mobile application built with Expo and TypeScript for real-time fire weather monitoring using Supabase Realtime.

## Purpose

The Five Forks Fire Weather app provides real-time monitoring of fire weather conditions and hotspots across Virginia counties. It displays:

- **Interactive Hotspot Map**: Real-time fire hotspots on an interactive map with location and intensity details
- **County Weather Metrics**: Live weather data including temperature, humidity, wind speed, dew point, and wind gusts
- **Fuel Spread Calculations**: Deterministic fire spread rate calculations for grass, timber litter, and pine stand fuel types

## Features

- ✅ **Real-time updates** via Supabase Realtime subscriptions
- ✅ **No authentication required** - publicly accessible data
- ✅ **TypeScript** for type safety
- ✅ **Cross-platform** - runs on iOS, Android, and web
- ✅ **Interactive maps** using react-native-maps
- ✅ **Automatic dew point calculation** using Magnus-Tetens formula
- ✅ **Fuel spread modeling** with simplified Rothermel-based approximations

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS only) or Android Emulator, or Expo Go app on your device
- A Supabase project with the required tables (see Database Schema below)

## Setup

### 1. Install Dependencies

```bash
cd apps/five-forks-fire-weather
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the app root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings under **Settings > API**.

### 3. Start the Development Server

```bash
npm start
# or
expo start
```

This will start the Expo development server. You can then:

- Press `i` to open in iOS Simulator (macOS only)
- Press `a` to open in Android Emulator
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your device

### 4. Run on Specific Platforms

```bash
# iOS (requires macOS)
npm run ios

# Android
npm run android

# Web
npm run web
```

## Database Schema

The app expects the following Supabase tables to exist:

### `hotspots` Table

Stores active fire hotspots with location and intensity information.

```sql
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  intensity INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  county TEXT NOT NULL
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE hotspots;
```

**Columns:**
- `id`: Unique identifier (UUID)
- `latitude`: Hotspot latitude
- `longitude`: Hotspot longitude
- `intensity`: Fire intensity (0-100)
- `timestamp`: Detection time
- `county`: County name

### `county_metrics` Table

Stores weather metrics for each county.

```sql
CREATE TABLE county_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  county TEXT NOT NULL,
  temp_c DOUBLE PRECISION NOT NULL,
  rh DOUBLE PRECISION NOT NULL,
  wind_speed_mps DOUBLE PRECISION NOT NULL,
  wind_gust_mps DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE county_metrics;
```

**Columns:**
- `id`: Unique identifier (UUID)
- `county`: County name
- `temp_c`: Temperature in Celsius
- `rh`: Relative humidity (%)
- `wind_speed_mps`: Wind speed in meters per second
- `wind_gust_mps`: Wind gust speed in meters per second
- `timestamp`: Measurement time

## How Realtime Subscriptions Work

The app uses Supabase Realtime to subscribe to database changes:

1. **Initial Data Fetch**: When screens load, they fetch current data from the tables
2. **Realtime Subscription**: The app subscribes to INSERT, UPDATE, and DELETE events
3. **Automatic Updates**: When data changes in Supabase, the UI updates automatically
4. **Cleanup**: Subscriptions are properly cleaned up when components unmount

**Implementation:**
- `src/lib/realtime.ts`: Abstraction for subscribing to table changes
- `src/hooks/useHotspots.ts`: React hook for hotspot data
- `src/hooks/useCountyMetrics.ts`: React hook for county metrics

## Project Structure

```
apps/five-forks-fire-weather/
├── src/
│   ├── App.tsx                      # Main app with navigation setup
│   ├── types.ts                     # TypeScript type definitions
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Landing screen with navigation
│   │   ├── MapScreen.tsx            # Interactive map with hotspots
│   │   └── CountyListScreen.tsx    # Scrollable county metrics list
│   ├── components/
│   │   ├── CountyCard.tsx           # County weather metrics card
│   │   └── HotspotMarker.tsx       # Map marker for hotspots
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client initialization
│   │   ├── realtime.ts              # Realtime subscription utilities
│   │   └── fuelSpread.ts            # Fuel spread rate calculations
│   ├── hooks/
│   │   ├── useHotspots.ts           # Hook for hotspot data
│   │   └── useCountyMetrics.ts     # Hook for county metrics
│   └── utils/
│       └── weather.ts               # Weather calculations & conversions
├── assets/                          # App icons and images
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── app.json                         # Expo configuration
├── babel.config.js                  # Babel configuration
├── metro.config.js                  # Metro bundler configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## Fuel Spread Calculations

The app includes simplified Rothermel-like formulas for estimating fire spread rates:

### Available Functions (in `src/lib/fuelSpread.ts`)

1. **`computeGrassSpread(params)`** - For grass fuels (fine, flashy fuels)
2. **`computeTimberLitterSpread(params)`** - For forest floor litter
3. **`computePineStandSpread(params)`** - For pine stands with crown fire potential

**Input Parameters:**
```typescript
{
  fuelMoisture: number,  // percent
  windSpeed: number,      // m/s
  temperature: number,    // °C
  slope: number           // degrees
}
```

**Output:**
```typescript
{
  spreadRate: number,     // m/s
  explanation: string     // Human-readable breakdown
}
```

**Note:** These are simplified approximations for demonstration purposes. For production wildfire modeling, use validated models like BehavePlus or FARSITE.

## Weather Utilities

The `weather.ts` module provides:

- **`computeDewPoint(tempC, rh)`**: Magnus-Tetens formula for dew point
- **`celsiusToFahrenheit(tempC)`**: Temperature conversion
- **`mpsToMph(mps)`**: Wind speed conversion
- **`formatTemperature(tempC, useFahrenheit)`**: Formatted temperature strings
- **`formatWindSpeed(mps, useMph)`**: Formatted wind speed strings

## Testing

Run the test suite:

```bash
npm test
```

The test suite includes unit tests for fuel spread calculations with known inputs and expected outputs.

## Building for Production

### Web Build

```bash
npx expo export:web
```

### Native Builds

For native iOS and Android builds, use EAS Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

See [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/) for details.

## Architecture Notes

### No Authentication

Per project requirements, **no authentication is implemented**. The app assumes:
- Supabase tables have appropriate Row Level Security (RLS) policies for public read access
- The anonymous key (`SUPABASE_ANON_KEY`) has sufficient permissions
- All data is considered public

If you need to restrict access in production, configure RLS policies in Supabase.

### Real-time Data Flow

```
Supabase Database
      ↓ (Realtime subscription)
Custom Hooks (useHotspots, useCountyMetrics)
      ↓ (React state)
Screen Components (MapScreen, CountyListScreen)
      ↓ (Props)
UI Components (CountyCard, HotspotMarker)
```

## Troubleshooting

### "Supabase configuration is missing"

Make sure your `.env` file exists and contains valid `SUPABASE_URL` and `SUPABASE_ANON_KEY` values.

### Map doesn't show on iOS

Make sure you have location permissions enabled if using user location features.

### No data appears

1. Verify your Supabase tables exist and have data
2. Check that Realtime is enabled on the tables
3. Verify your Supabase URL and anonymous key are correct
4. Check the console for error messages

### Build errors

Try clearing caches:

```bash
rm -rf node_modules
npm install
npx expo start -c
```

## Contributing

See the main repository CONTRIBUTING.md for contribution guidelines.

## License

See the main repository for license information.
