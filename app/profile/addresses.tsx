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
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, MapPin, Chrome as Home, Briefcase, CreditCard as Edit, Trash2, Star } from 'lucide-react-native';
import { getUserAddresses, createAddress, type DeliveryAddress } from '@/lib/database';

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

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const addressesData = await getUserAddresses();
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
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

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return Home;
      case 'work':
      case 'office':
        return Briefcase;
      default:
        return MapPin;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#0077b6" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="#0077b6" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin color="#90e0ef" size={80} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptyText}>
              Add your delivery addresses for faster checkout
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addFirstButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => {
            const IconComponent = getAddressIcon(address.label);
            return (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressLabelContainer}>
                    <View style={styles.addressIcon}>
                      <IconComponent color="#0077b6" size={20} />
                    </View>
                    <Text style={styles.addressLabel}>{address.label}</Text>
                    {address.is_default && (
                      <View style={styles.defaultBadge}>
                        <Star color="#48cae4" size={12} fill="#48cae4" />
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Edit color="#0077b6" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Trash2 color="#023e8a" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.addressDetails}>
                  <Text style={styles.addressLine}>{address.address_line_1}</Text>
                  {address.address_line_2 && (
                    <Text style={styles.addressLine}>{address.address_line_2}</Text>
                  )}
                  <Text style={styles.addressLine}>
                    {address.city}, {address.state} {address.zip_code}
                  </Text>
                </View>
              </View>
            );
          })
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
    backgroundColor: '#caf0f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#caf0f8',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#03045e',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    backgroundColor: '#0077b6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ade8f4',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ade8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#03045e',
    marginRight: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ade8f4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0077b6',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  addressDetails: {
    gap: 4,
  },
  addressLine: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0077b6',
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