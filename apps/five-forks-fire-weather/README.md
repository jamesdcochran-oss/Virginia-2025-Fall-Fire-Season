# Five Forks Fire Weather - Mobile App

A React Native mobile application for monitoring fire weather conditions and hotspots in Virginia, built with Expo and powered by Supabase Realtime.

## Purpose

This app provides real-time fire weather monitoring for the Five Forks region in Virginia. It displays:

- **Interactive Map**: Fire hotspots with real-time updates
- **County Metrics**: Weather conditions by county including temperature, humidity, wind speed, and calculated dew point
- **Fuel Spread Calculations**: Utilities for estimating fire spread rates in different fuel types

The app is designed as a monitoring tool and does **not** include authentication. All data is public and streamed via Supabase Realtime.

## Features

### Real-time Data
- Subscribes to Supabase Realtime channels for live updates
- Automatic UI updates when data changes in the backend
- No polling - efficient push-based updates

### Map View
- Interactive map showing fire hotspot locations
- Custom markers with color-coded intensity
- Tap markers to view detailed information (county, intensity, timestamp)

### County Metrics
- Scrollable list of county weather cards
- Display temperature (°C/°F), relative humidity, wind speed, wind gusts
- Automatically computed dew point using Magnus-Tetens formula
- Real-time updates as new metrics arrive

### Fuel Spread Models
- Three fuel type models: Grass, Timber Litter, Pine Stand
- Based on simplified Rothermel-style approximations
- Factors: fuel moisture, wind speed, temperature, slope
- Returns spread rate (m/s) and detailed explanation

## Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Supabase account with a project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season.git
   cd Virginia-2025-Fall-Fire-Season/apps/five-forks-fire-weather
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**:
   
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Note**: For React Native/Expo, you may need to use `expo-constants` or `react-native-dotenv` for proper environment variable handling. For development, you can temporarily hardcode values in `src/lib/supabase.ts` (never commit credentials!).

4. **Start the development server**:
   ```bash
   npm start
   # or
   yarn start
   # or
   expo start
   ```

5. **Run on device/simulator**:
   - **iOS**: Press `i` or run `npm run ios`
   - **Android**: Press `a` or run `npm run android`
   - **Web**: Press `w` or run `npm run web`
   - **Expo Go**: Scan the QR code with the Expo Go app

## Supabase Schema

The app expects the following Supabase tables:

### `hotspots` Table

```sql
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  intensity NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  county TEXT NOT NULL
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE hotspots;
```

### `county_metrics` Table

```sql
CREATE TABLE county_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  county TEXT NOT NULL,
  temp_c NUMERIC NOT NULL,
  rh NUMERIC NOT NULL,
  wind_speed_mps NUMERIC NOT NULL,
  wind_gust_mps NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE county_metrics;
```

**Note**: Ensure Realtime is enabled for these tables in your Supabase project settings.

## Project Structure

```
apps/five-forks-fire-weather/
├── README.md                  # This file
├── package.json               # Dependencies and scripts
├── app.json                   # Expo configuration
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel configuration
├── jest.config.js             # Jest test configuration
├── .gitignore                 # Git ignore patterns
├── .env.example               # Environment variables template
└── src/
    ├── App.tsx                # Main app entry with navigation
    ├── types.ts               # TypeScript type definitions
    ├── screens/
    │   ├── HomeScreen.tsx     # Landing page with navigation
    │   ├── MapScreen.tsx      # Interactive map with hotspots
    │   └── CountyListScreen.tsx # County metrics list
    ├── components/
    │   ├── CountyCard.tsx     # County weather card component
    │   └── HotspotMarker.tsx  # Map marker component
    ├── lib/
    │   ├── supabase.ts        # Supabase client initialization
    │   ├── realtime.ts        # Realtime subscriptions abstraction
    │   ├── fuelSpread.ts      # Fuel spread rate calculations
    │   └── fuelSpread.test.ts # Unit tests for fuel spread
    ├── hooks/
    │   ├── useHotspots.ts     # Hook for hotspot data + realtime
    │   └── useCountyMetrics.ts # Hook for county metrics + realtime
    ├── utils/
    │   └── weather.ts         # Weather calculations (dew point, conversions)
    └── assets/                # Images and icons (placeholder)
```

## How Realtime Works

The app uses Supabase Realtime to subscribe to database changes:

1. **Subscriptions**: `src/lib/realtime.ts` provides subscription functions for `hotspots` and `county_metrics` tables
2. **Hooks**: `useHotspots` and `useCountyMetrics` manage subscriptions and local state
3. **Updates**: When data changes in Supabase (INSERT/UPDATE/DELETE), the app receives events and updates the UI automatically
4. **Cleanup**: Subscriptions are cleaned up when components unmount to prevent memory leaks

No authentication is required - the app uses the public anonymous key.

## Fuel Spread Calculations

The `src/lib/fuelSpread.ts` module provides three fuel type models:

- **`computeGrassSpread(params)`**: Fine grass fuels, high wind sensitivity
- **`computeTimberLitterSpread(params)`**: Forest floor needles and leaves
- **`computePineStandSpread(params)`**: Pine stand surface fuels

Each function accepts:
```typescript
{
  fuelMoisture: number,  // percent (0-100)
  windSpeed: number,     // m/s
  temperature: number,   // °C
  slope: number          // degrees
}
```

And returns:
```typescript
{
  spreadRate: number,    // m/s
  explanation: string    // Human-readable calculation breakdown
}
```

These are **simplified models** for demonstration purposes, based on Rothermel-style approximations. They are not intended for operational fire prediction.

## Testing

Unit tests are included for the fuel spread functions:

```bash
npm test
# or
yarn test
```

Tests validate:
- Positive spread rates for normal conditions
- Correct response to wind, moisture, slope changes
- Proper handling of edge cases and extreme values

## Development Notes

### No Authentication
By design, this app does not include authentication. All data access uses the Supabase anonymous key. Ensure your Supabase Row Level Security (RLS) policies are configured appropriately if you're restricting access.

### Environment Variables
For production builds, use proper environment variable management (e.g., `react-native-dotenv`, Expo's environment variable support, or secret management services). Never commit actual credentials to version control.

### Maps Configuration
- iOS: The app uses `react-native-maps` which requires additional setup for iOS (add Google Maps API key if using Google Maps, or use Apple Maps)
- Android: May require Google Maps API key configuration
- Web: Uses a web-compatible map implementation

Refer to the [react-native-maps documentation](https://github.com/react-native-maps/react-native-maps) for platform-specific setup.

## Building for Production

### Build Commands

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Modern EAS Build (recommended)
eas build --platform ios
eas build --platform android
```

Refer to [Expo documentation](https://docs.expo.dev/build/introduction/) for detailed build instructions.

## Troubleshooting

### Supabase Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is running and accessible
- Ensure tables exist and Realtime is enabled

### Map Not Displaying
- Check device/simulator has location permissions
- Verify `react-native-maps` is properly installed
- For iOS, ensure you've run `pod install` in the `ios` folder

### Realtime Not Updating
- Verify Realtime is enabled in Supabase project settings
- Check that tables are added to the `supabase_realtime` publication
- Look for errors in console/logs

## Contributing

This is a prototype/scaffold application. For improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See the main repository LICENSE file.

## Contact

For questions or issues, open an issue in the main repository:
https://github.com/jamesdcochran-oss/Virginia-2025-Fall-Fire-Season/issues
