# Five Forks Fire Weather Mobile App

React Native mobile application for real-time fire weather monitoring and hotspot tracking in Virginia.

## Purpose

The Five Forks Fire Weather app provides real-time monitoring of:
- **Hotspot locations** on an interactive map
- **County-level weather metrics** (temperature, humidity, wind, dew point)
- **Fuel spread rate calculations** for grass, timber litter, and pine stands

Data updates in real-time via Supabase Realtime subscriptions. No authentication is required by design.

## Features

- 🗺️ **Interactive Map**: View hotspot locations with intensity-based color coding
- 📊 **County Metrics Dashboard**: Scrollable list of county weather data with real-time updates
- 🔥 **Fuel Spread Calculations**: Compute fire spread rates for different fuel types
- ⚡ **Real-time Updates**: Automatic data synchronization via Supabase Realtime
- 📱 **Cross-platform**: Works on iOS, Android, and Web

## Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- (Optional) iOS Simulator or Android emulator for testing
- Active Supabase project with the required tables (see below)

### Installation

1. **Navigate to the app directory**:
   ```bash
   cd apps/five-forks-fire-weather
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**:
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   Get these values from your Supabase project settings:
   - Go to https://app.supabase.com
   - Select your project
   - Go to Settings → API
   - Copy the Project URL and anon/public key

4. **Start the development server**:
   ```bash
   npm start
   # or
   yarn start
   # or
   expo start
   ```

5. **Run on a device/emulator**:
   - **iOS**: Press `i` in the terminal or run `npm run ios`
   - **Android**: Press `a` in the terminal or run `npm run android`
   - **Web**: Press `w` in the terminal or run `npm run web`
   - **Physical device**: Scan the QR code with Expo Go app

## Supabase Configuration

### Required Tables Schema

The app expects two tables in your Supabase database:

#### 1. `hotspots` table

```sql
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  intensity DECIMAL NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  county TEXT NOT NULL
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE hotspots;
```

#### 2. `county_metrics` table

```sql
CREATE TABLE county_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  county TEXT NOT NULL,
  temp_c DECIMAL NOT NULL,
  rh DECIMAL NOT NULL,
  wind_speed_mps DECIMAL NOT NULL,
  wind_gust_mps DECIMAL NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE county_metrics;
```

### Enable Realtime

In your Supabase dashboard:
1. Go to Database → Replication
2. Enable replication for `hotspots` and `county_metrics` tables
3. Make sure the tables are added to the `supabase_realtime` publication

### Row Level Security (RLS)

Since no authentication is used, you'll need to configure RLS policies to allow anonymous access:

```sql
-- Enable RLS
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE county_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read" ON hotspots FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON county_metrics FOR SELECT USING (true);

-- Optional: Allow anonymous insert (for testing)
CREATE POLICY "Allow anonymous insert" ON hotspots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON county_metrics FOR INSERT WITH CHECK (true);
```

## How Realtime Works

The app uses Supabase Realtime to subscribe to database changes:

1. **Initial Data Load**: When screens load, they fetch existing data from Supabase
2. **Realtime Subscription**: Hooks subscribe to table changes (INSERT, UPDATE, DELETE)
3. **Automatic Updates**: When data changes in Supabase, the UI updates instantly
4. **Clean Unsubscribe**: Subscriptions are cleaned up when components unmount

See `src/lib/realtime.ts` for the subscription abstraction and `src/hooks/` for usage examples.

## Project Structure

```
apps/five-forks-fire-weather/
├── README.md                 # This file
├── package.json              # Dependencies and scripts
├── app.json                  # Expo configuration
├── tsconfig.json             # TypeScript configuration
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler configuration
├── jest.config.js            # Jest test configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── src/
    ├── App.tsx               # Main app component with navigation
    ├── types.ts              # TypeScript type definitions
    ├── screens/
    │   ├── HomeScreen.tsx    # Landing screen with navigation
    │   ├── MapScreen.tsx     # Interactive map with hotspots
    │   └── CountyListScreen.tsx  # County metrics list
    ├── components/
    │   ├── CountyCard.tsx    # County weather data card
    │   └── HotspotMarker.tsx # Map marker for hotspots
    ├── lib/
    │   ├── supabase.ts       # Supabase client initialization
    │   ├── realtime.ts       # Realtime subscription abstraction
    │   ├── fuelSpread.ts     # Fuel spread rate calculations
    │   └── fuelSpread.test.ts # Unit tests
    ├── hooks/
    │   ├── useHotspots.ts    # Hook for hotspot data
    │   └── useCountyMetrics.ts # Hook for county metrics
    ├── utils/
    │   └── weather.ts        # Weather utility functions
    └── assets/               # Images and icons
```

## Fuel Spread Calculations

The app includes fuel spread rate calculators for three fuel types:

### 1. Grass Fuels (`computeGrassSpread`)

- Fast-spreading surface fuels
- Highly wind-driven
- Moisture extinction: ~12-15%
- Based on Fuel Models 1-3

### 2. Timber Litter (`computeTimberLitterSpread`)

- Slower than grass
- Less wind-driven (canopy protection)
- More slope-sensitive
- Moisture extinction: ~20-25%
- Based on Fuel Models 8-10

### 3. Pine Stands (`computePineStandSpread`)

- Moderate spread rate
- Crown fire potential at high wind + low moisture
- Factors in ladder fuels
- Based on Fuel Models 9-10

**Parameters for all calculations:**
- `fuelMoisture`: Percent (0-100)
- `windSpeed`: Meters per second
- `temperature`: Degrees Celsius
- `slope`: Degrees

**Output:**
- `spreadRate`: Meters per second
- `explanation`: Detailed breakdown of factors

**Note**: These are simplified Rothermel-like approximations for demonstration. Production fire modeling should use validated tools like BehavePlus, FARSITE, or FlamMap.

## Scripts

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web

# Build for production
npm run build

# Run tests
npm test
```

## Testing

Unit tests are included for the fuel spread calculations:

```bash
npm test
```

Tests validate:
- Spread rate calculations for all fuel types
- Moisture effects on spread
- Wind effects on spread
- Slope effects on spread
- Crown fire detection in pine stands
- Edge cases and extreme values

## No Authentication

**By design, this app does NOT include authentication.** All data is accessed anonymously through Supabase's public API with the anon key. If you need authentication, you'll need to:

1. Configure Supabase Auth
2. Add sign-in screens
3. Update RLS policies to require authentication
4. Modify the Supabase client configuration

## Troubleshooting

### App won't start
- Make sure you're in the correct directory: `apps/five-forks-fire-weather`
- Run `npm install` to ensure dependencies are installed
- Clear cache: `expo start -c`

### No data showing
- Verify Supabase credentials in `.env` are correct
- Check that tables exist and have data
- Confirm realtime is enabled for tables
- Check RLS policies allow anonymous access
- Look at console logs for errors

### Map not displaying
- Ensure you have an internet connection (for map tiles)
- On Android, you may need Google Play Services
- Check console for map-related errors

### Realtime updates not working
- Verify tables are added to `supabase_realtime` publication
- Check that replication is enabled in Supabase dashboard
- Ensure your Supabase project is not paused
- Check console for subscription errors

## Development Notes

- The app uses Expo managed workflow for easier development
- TypeScript is used throughout for type safety
- Navigation uses React Navigation v6
- Maps use `react-native-maps` (Google Maps on Android, Apple Maps on iOS)
- Realtime subscriptions automatically reconnect on network issues

## License

(Add license information here)

## Contributing

See the main repository CONTRIBUTING.md for contribution guidelines.

## Support

For issues or questions, please open an issue in the main repository.
