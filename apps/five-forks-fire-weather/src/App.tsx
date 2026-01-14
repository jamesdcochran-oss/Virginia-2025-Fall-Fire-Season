import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { MapScreen } from './src/screens/MapScreen';
import { CountyListScreen } from './src/screens/CountyListScreen';

type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  Counties: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Five Forks Fire Weather App
 * 
 * A mobile application for real-time fire weather monitoring using Supabase Realtime.
 * 
 * Features:
 * - Real-time hotspot tracking on an interactive map
 * - Live county weather metrics with automatic updates
 * - Fuel spread rate calculations for different fuel types
 * - Dew point calculations and weather utilities
 * 
 * No authentication required - all data is publicly accessible via Supabase.
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#d32f2f',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: 'Hotspot Map' }}
        />
        <Stack.Screen
          name="Counties"
          component={CountyListScreen}
          options={{ title: 'County Metrics' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

