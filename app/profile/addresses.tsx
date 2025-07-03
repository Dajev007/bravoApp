import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, MapPin, Chrome as Home, Briefcase, CreditCard as Edit, Trash2, Star } from 'lucide-react-native';
import { getUserAddresses, createAddress, type DeliveryAddress } from '@/lib/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const addressesData = await getUserAddresses();
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.address_line_1 || !newAddress.city || !newAddress.state || !newAddress.zip_code) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createAddress(newAddress);
      setShowAddModal(false);
      setNewAddress({
        label: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip_code: '',
        is_default: false,
      });
      loadAddresses();
      Alert.alert('Success', 'Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Error', 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId: string, label: string) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
                         setDeletingId(addressId);
             try {
               // TODO: Implement deleteAddress function
               // await deleteAddress(addressId);
               setAddresses(prev => prev.filter(addr => addr.id !== addressId));
               Alert.alert('Success', 'Address deleted successfully');
             } catch (error) {
               console.error('Error deleting address:', error);
               Alert.alert('Error', 'Failed to delete address');
             } finally {
               setDeletingId(null);
             }
          },
        },
      ]
    );
  };

  const getAddressIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return Home;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return Briefcase;
    return MapPin;
  };

  const formatAddress = (address: DeliveryAddress) => {
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state,
      address.zip_code,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b8dba" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b8dba', '#a2c7e7']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin color="#a2c7e7" size={80} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptyText}>
              Add your first delivery address to make ordering faster and easier.
            </Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addFirstButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressesList}>
            {addresses.map((address) => {
              const IconComponent = getAddressIcon(address.label);
              return (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressLabelContainer}>
                      <View style={styles.addressIcon}>
                        <IconComponent color="#3b8dba" size={20} />
                      </View>
                      <View style={styles.addressLabelText}>
                        <Text style={styles.addressLabel}>{address.label}</Text>
                        {address.is_default && (
                          <View style={styles.defaultBadge}>
                            <Star color="#3b8dba" size={12} fill="#3b8dba" />
                            <Text style={styles.defaultText}>Default</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {}}
                      >
                        <Edit color="#3b8dba" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteAddress(address.id, address.label)}
                        disabled={deletingId === address.id}
                      >
                        {deletingId === address.id ? (
                          <ActivityIndicator size={16} color="#ffffff" />
                        ) : (
                          <Trash2 color="#ffffff" size={20} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.addressText}>{formatAddress(address)}</Text>

                  {!address.is_default && (
                    <TouchableOpacity style={styles.setDefaultButton} onPress={() => {}}>
                      <Text style={styles.setDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            <TouchableOpacity style={styles.addNewButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addNewText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Address</Text>
            <TouchableOpacity onPress={handleAddAddress}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address Label</Text>
              <TextInput
                style={styles.input}
                value={newAddress.label}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, label: text }))}
                placeholder="e.g., Home, Work, etc."
                placeholderTextColor="#90e0ef"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={newAddress.address_line_1}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, address_line_1: text }))}
                placeholder="Enter street address"
                placeholderTextColor="#90e0ef"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Apartment, Suite, etc. (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newAddress.address_line_2}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, address_line_2: text }))}
                placeholder="Apt, Suite, Floor, etc."
                placeholderTextColor="#90e0ef"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 2 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                  placeholderTextColor="#90e0ef"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={newAddress.state}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  placeholderTextColor="#90e0ef"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                value={newAddress.zip_code}
                onChangeText={(text) => setNewAddress(prev => ({ ...prev, zip_code: text }))}
                placeholder="ZIP Code"
                placeholderTextColor="#90e0ef"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.defaultToggle}
              onPress={() => setNewAddress(prev => ({ ...prev, is_default: !prev.is_default }))}
            >
              <View style={styles.defaultToggleLeft}>
                <Star 
                  color={newAddress.is_default ? "#48cae4" : "#90e0ef"} 
                  size={20} 
                  fill={newAddress.is_default ? "#48cae4" : "transparent"}
                />
                <Text style={styles.defaultToggleText}>Set as default address</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e3a8a',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b8dba',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  addressesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#b1e0e7',
    shadowColor: '#3b8dba',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressLabelText: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  addressText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#3b8dba',
    lineHeight: 22,
    marginBottom: 16,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b8dba',
  },
  setDefaultText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#b1e0e7',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 20,
  },
  addNewText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3b8dba',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  modalHeader: {
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
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  modalSave: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0077b6',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  defaultToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultToggleText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#03045e',
  },
});