import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Search, Navigation, X, Check } from 'lucide-react-native';
import { useLocation, LocationData } from '@/contexts/LocationContext';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
}

export function LocationPicker({ visible, onClose }: LocationPickerProps) {
  const { 
    location, 
    hasLocationPermission, 
    requestLocationPermission, 
    getCurrentLocation, 
    setManualLocation, 
    clearManualLocation,
    isLoading 
  } = useLocation();
  
  const [searchAddress, setSearchAddress] = useState('');
  const [customLocation, setCustomLocation] = useState({
    address: '',
    city: '',
    state: '',
  });
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingAction('current');
      
      if (!hasLocationPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location Permission Required',
            'Please grant location permission to use your current location.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      await getCurrentLocation();
      onClose();
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSetManualLocation = async () => {
    if (!customLocation.address || !customLocation.city || !customLocation.state) {
      Alert.alert('Error', 'Please fill in all location fields.');
      return;
    }

    try {
      setLoadingAction('manual');
      
      const manualLocationData: LocationData = {
        address: customLocation.address,
        city: customLocation.city,
        state: customLocation.state,
        latitude: 0, // Will be updated if needed
        longitude: 0, // Will be updated if needed
        isManuallySet: true,
      };

      await setManualLocation(manualLocationData);
      
      Alert.alert('Success', 'Location updated successfully!', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      console.error('Error setting manual location:', error);
      Alert.alert('Error', 'Could not save your location. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUseAutoLocation = async () => {
    try {
      setLoadingAction('auto');
      await clearManualLocation();
      
      Alert.alert('Success', 'Switched to automatic location detection!', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      console.error('Error clearing manual location:', error);
      Alert.alert('Error', 'Could not switch to automatic location.');
    } finally {
      setLoadingAction(null);
    }
  };

  const resetCustomLocation = () => {
    setCustomLocation({ address: '', city: '', state: '' });
    setSearchAddress('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#0077b6" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Location</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Location Info */}
          <View style={styles.currentLocationCard}>
            <View style={styles.currentLocationHeader}>
              <MapPin color="#0077b6" size={20} />
              <Text style={styles.currentLocationTitle}>Current Location</Text>
            </View>
            
            {location ? (
              <View style={styles.currentLocationInfo}>
                <Text style={styles.currentLocationAddress}>{location.address}</Text>
                <Text style={styles.currentLocationDetails}>
                  {location.city}, {location.state}
                </Text>
                {location.isManuallySet && (
                  <View style={styles.manualBadge}>
                    <Text style={styles.manualBadgeText}>Manually Set</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noLocationText}>No location set</Text>
            )}
          </View>

          {/* Use Current GPS Location */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleUseCurrentLocation}
            disabled={loadingAction === 'current'}
          >
            <View style={styles.actionButtonContent}>
              <Navigation color="#FFFFFF" size={20} />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Use Current Location</Text>
                <Text style={styles.actionButtonSubtitle}>
                  {hasLocationPermission 
                    ? 'Detect your location automatically' 
                    : 'Permission required'
                  }
                </Text>
              </View>
            </View>
            {loadingAction === 'current' && (
              <ActivityIndicator color="#FFFFFF" size="small" />
            )}
          </TouchableOpacity>

          {/* Manual Location Entry */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Or Enter Location Manually</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={customLocation.address}
                onChangeText={(text) => setCustomLocation(prev => ({ ...prev, address: text }))}
                placeholder="Enter street address"
                placeholderTextColor="#90e0ef"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 2 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={customLocation.city}
                  onChangeText={(text) => setCustomLocation(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                  placeholderTextColor="#90e0ef"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  value={customLocation.state}
                  onChangeText={(text) => setCustomLocation(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  placeholderTextColor="#90e0ef"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.setLocationButton}
              onPress={handleSetManualLocation}
              disabled={loadingAction === 'manual'}
            >
              <Check color="#0077b6" size={20} />
              <Text style={styles.setLocationButtonText}>Set This Location</Text>
              {loadingAction === 'manual' && (
                <ActivityIndicator color="#0077b6" size="small" />
              )}
            </TouchableOpacity>
          </View>

          {/* Reset to Auto Location */}
          {location?.isManuallySet && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleUseAutoLocation}
              disabled={loadingAction === 'auto'}
            >
              <Text style={styles.resetButtonText}>Switch to Automatic Location</Text>
              {loadingAction === 'auto' && (
                <ActivityIndicator color="#023e8a" size="small" />
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#90e0ef',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentLocationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  currentLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
  },
  currentLocationInfo: {
    gap: 4,
  },
  currentLocationAddress: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  currentLocationDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  manualBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ade8f4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  manualBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  noLocationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#90e0ef',
  },
  actionButton: {
    backgroundColor: '#0077b6',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ade8f4',
    marginTop: 2,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#03045e',
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  row: {
    flexDirection: 'row',
  },
  setLocationButton: {
    backgroundColor: '#ade8f4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  setLocationButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0077b6',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#023e8a',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#023e8a',
  },
}); 