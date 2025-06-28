import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  isManuallySet: boolean;
}

interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  hasLocationPermission: boolean;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  setManualLocation: (location: LocationData) => Promise<void>;
  clearManualLocation: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

const LOCATION_STORAGE_KEY = '@bravoapp_manual_location';
const DEFAULT_LOCATION: LocationData = {
  address: 'Downtown',
  city: 'San Francisco',
  state: 'CA',
  latitude: 37.7749,
  longitude: -122.4194,
  isManuallySet: false,
};

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      // Check for manual location first
      const manualLocation = await getStoredManualLocation();
      if (manualLocation) {
        setLocation(manualLocation);
        setIsLoading(false);
        return;
      }

      // Check location permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setHasLocationPermission(hasPermission);

      if (hasPermission) {
        await getCurrentLocation();
      } else {
        // Use default location if no permission
        setLocation(DEFAULT_LOCATION);
      }
    } catch (error) {
      console.error('Error initializing location:', error);
      setLocation(DEFAULT_LOCATION);
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredManualLocation = async (): Promise<LocationData | null> => {
    try {
      const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading stored location:', error);
      return null;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      
      if (granted) {
        await getCurrentLocation();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      // Reverse geocode to get address
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geocoded.length > 0) {
        const result = geocoded[0];
        const locationData: LocationData = {
          address: result.name || result.street || 'Current Location',
          city: result.city || 'Unknown City',
          state: result.region || 'Unknown State',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isManuallySet: false,
        };
        
        setLocation(locationData);
      } else {
        throw new Error('Could not get address from coordinates');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      // Fall back to default location
      setLocation(DEFAULT_LOCATION);
    } finally {
      setIsLoading(false);
    }
  };

  const setManualLocation = async (manualLocation: LocationData): Promise<void> => {
    try {
      const locationWithFlag = { ...manualLocation, isManuallySet: true };
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationWithFlag));
      setLocation(locationWithFlag);
    } catch (error) {
      console.error('Error saving manual location:', error);
      throw error;
    }
  };

  const clearManualLocation = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
      
      // Refresh with automatic location if permission is granted
      if (hasLocationPermission) {
        await getCurrentLocation();
      } else {
        setLocation(DEFAULT_LOCATION);
      }
    } catch (error) {
      console.error('Error clearing manual location:', error);
      throw error;
    }
  };

  const refreshLocation = async (): Promise<void> => {
    const manualLocation = await getStoredManualLocation();
    if (manualLocation) {
      setLocation(manualLocation);
    } else if (hasLocationPermission) {
      await getCurrentLocation();
    } else {
      setLocation(DEFAULT_LOCATION);
    }
  };

  const value = {
    location,
    isLoading,
    hasLocationPermission,
    requestLocationPermission,
    getCurrentLocation,
    setManualLocation,
    clearManualLocation,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
} 