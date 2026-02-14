/**
 * App.tsx - Main application entry point
 * 
 * Sets up React Navigation with a stack navigator for the three main screens:
 * - Home: Landing page with navigation buttons
 * - Map: Interactive map showing fire hotspots
 * - CountyList: Scrollable list of county weather metrics
 * 
 * All screens use Supabase Realtime for live data updates.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './screens/HomeScreen';
import { MapScreen } from './screens/MapScreen';
import { CountyListScreen } from './screens/CountyListScreen';

export type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  CountyList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          options={{
            title: 'Five Forks Fire Weather',
          }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Hotspot Map',
          }}
        />
        <Stack.Screen
          name="CountyList"
          component={CountyListScreen}
          options={{
            title: 'County Metrics',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
